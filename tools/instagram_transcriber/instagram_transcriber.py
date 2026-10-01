"""
Instagram Reel Transcriber
--------------------------
Paste public Instagram Reel links (one per line). For each link the tool
downloads the audio with yt-dlp, transcribes it word-for-word with
faster-whisper, and saves:

    transcripts/01_<code>.txt          one file per Reel
    transcripts/all_transcripts_<time>.txt   all Reels in one file

Only publicly accessible Reels are processed. Private, deleted or
login-only Reels are reported and skipped.

Usage (CMD):
    python instagram_transcriber.py
    python instagram_transcriber.py --language auto --model small
    python instagram_transcriber.py links.txt
"""

import argparse
import re
import sys
import time
from datetime import datetime
from pathlib import Path

# ---------------------------------------------------------------- settings --
DEFAULT_MODEL = "large-v3"   # most accurate; use "medium" or "small" for speed
DEFAULT_LANGUAGE = "az"      # Azerbaijani; "auto" lets Whisper detect it
DELAY_BETWEEN_REELS = 5      # seconds, to avoid Instagram rate limits
RATE_LIMIT_WAIT = 60         # seconds to wait once after an HTTP 429

BASE_DIR = Path(__file__).resolve().parent
DOWNLOAD_DIR = BASE_DIR / "downloads"
TRANSCRIPT_DIR = BASE_DIR / "transcripts"
SEPARATOR = "=" * 80

URL_RE = re.compile(
    r"https?://(?:www\.)?instagram\.com/(?:[A-Za-z0-9_.]+/)?(?:reels?|p|tv)/([A-Za-z0-9_-]+)",
    re.IGNORECASE,
)

# Windows CMD: print Azerbaijani letters (ə, ş, ğ ...) correctly
for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8", errors="replace")
    except AttributeError:
        pass


class ReelError(Exception):
    """A Reel could not be processed; the message is shown to the user."""


# ------------------------------------------------------------------ input --
def extract_links(text):
    """Return unique (shortcode, url) pairs found in the text, in order."""
    seen, links = set(), []
    for match in URL_RE.finditer(text):
        code = match.group(1)
        if code not in seen:
            seen.add(code)
            links.append((code, f"https://www.instagram.com/reel/{code}/"))
    return links


def read_links_interactively():
    print("Paste Instagram Reel links, one per line.")
    print("Press Enter on an empty line when you are done.\n")
    lines = []
    while True:
        try:
            line = input()
        except EOFError:
            break
        if not line.strip():
            if lines:
                break
            continue
        lines.append(line)
    return "\n".join(lines)


# --------------------------------------------------------------- download --
def explain_download_error(message):
    m = message.lower()
    if "429" in m or "too many requests" in m:
        return "Instagram is rate-limiting requests (HTTP 429). Try again later."
    if "private" in m:
        return "This Reel is private."
    if "login" in m or "cookies" in m:
        return "Instagram requires login to view this Reel (not publicly accessible)."
    if "404" in m or "not found" in m or "unavailable" in m or "deleted" in m:
        return "This Reel was not found (deleted or the link is wrong)."
    if "no video formats" in m or "requested format" in m:
        return "No downloadable media was found in this post."
    return "Could not access this Reel: " + message.strip().splitlines()[-1][:200]


class _QuietLogger:
    def debug(self, msg): pass
    def info(self, msg): pass
    def warning(self, msg): pass
    def error(self, msg): pass


def download_audio(url, code):
    import yt_dlp

    DOWNLOAD_DIR.mkdir(exist_ok=True)
    opts = {
        # audio-only stream when available, so ffmpeg is not needed
        "format": "bestaudio/best",
        "outtmpl": str(DOWNLOAD_DIR / f"{code}.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
        "noprogress": True,
        "playlist_items": "1",
        "retries": 3,
        "socket_timeout": 30,
        "logger": _QuietLogger(),  # errors are reported in plain words instead
    }
    for attempt in (1, 2):
        try:
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url, download=True)
            break
        except yt_dlp.utils.DownloadError as e:
            reason = explain_download_error(str(e))
            if "429" in reason and attempt == 1:
                print(f"   Rate-limited. Waiting {RATE_LIMIT_WAIT} s and retrying once...")
                time.sleep(RATE_LIMIT_WAIT)
                continue
            raise ReelError(reason) from None

    if info.get("entries"):
        info = next((e for e in info["entries"] if e), None) or {}
    downloads = info.get("requested_downloads") or []
    path = Path(downloads[0]["filepath"]) if downloads else None
    if not path or not path.exists():
        found = sorted(DOWNLOAD_DIR.glob(f"{code}.*"))
        if not found:
            raise ReelError("Download finished but no media file was saved.")
        path = found[0]
    return path


# ------------------------------------------------------------- transcribe --
_model = None


def load_model(name):
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        try:
            import ctranslate2
            use_gpu = ctranslate2.get_cuda_device_count() > 0
        except Exception:
            use_gpu = False
        device, compute = ("cuda", "float16") if use_gpu else ("cpu", "int8")
        print(f"Loading Whisper model '{name}' on {device.upper()} "
              "(first run downloads it, this can take a few minutes)...")
        _model = WhisperModel(name, device=device, compute_type=compute)
    return _model


def transcribe(path, model_name, language):
    model = load_model(model_name)
    segments, info = model.transcribe(
        str(path),
        language=None if language == "auto" else language,
        beam_size=5,
        vad_filter=True,                   # skip music-only parts
        condition_on_previous_text=False,  # avoids repeated-phrase loops
    )
    text = " ".join(s.text.strip() for s in segments).strip()
    return text, info.language


# ------------------------------------------------------------------ output --
def block(index, url, body):
    return f"{SEPARATOR}\n[{index}] {url}\n{SEPARATOR}\n{body}\n\n"


def main():
    parser = argparse.ArgumentParser(description="Transcribe public Instagram Reels to text.")
    parser.add_argument("links_file", nargs="?", help="optional .txt file with one link per line")
    parser.add_argument("--model", default=DEFAULT_MODEL,
                        help=f"Whisper model: tiny, base, small, medium, large-v3 (default {DEFAULT_MODEL})")
    parser.add_argument("--language", default=DEFAULT_LANGUAGE,
                        help=f"language code such as az, tr, en, ru, or 'auto' (default {DEFAULT_LANGUAGE})")
    parser.add_argument("--keep-audio", action="store_true", help="keep downloaded audio files")
    args = parser.parse_args()

    if args.links_file:
        text = Path(args.links_file).read_text(encoding="utf-8", errors="ignore")
    else:
        text = read_links_interactively()

    links = extract_links(text)
    if not links:
        print("No Instagram Reel links found. Example: https://www.instagram.com/reel/ABC123xyz/")
        return 1

    TRANSCRIPT_DIR.mkdir(exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    combined_path = TRANSCRIPT_DIR / f"all_transcripts_{stamp}.txt"
    combined_path.write_text(
        f"Instagram Reel transcripts - {datetime.now():%Y-%m-%d %H:%M}\n"
        f"Links: {len(links)}\n\n", encoding="utf-8")

    print(f"\nFound {len(links)} link(s). Starting...\n")
    ok, failed = [], []

    for i, (code, url) in enumerate(links, 1):
        print(f"[{i}/{len(links)}] {url}")
        audio = None
        try:
            print("   Downloading audio...")
            audio = download_audio(url, code)
            print("   Transcribing...")
            text, lang = transcribe(audio, args.model, args.language)
            if not text:
                text = "(No speech detected - the Reel may contain only music or on-screen text.)"
            out = TRANSCRIPT_DIR / f"{i:02d}_{code}.txt"
            out.write_text(block(i, url, text), encoding="utf-8")
            with combined_path.open("a", encoding="utf-8") as f:
                f.write(block(i, url, text))
            ok.append(url)
            print(f"   Saved: {out.name} (language: {lang})")
        except ReelError as e:
            failed.append((url, str(e)))
            print(f"   SKIPPED: {e}")
            with combined_path.open("a", encoding="utf-8") as f:
                f.write(block(i, url, f"(Not transcribed: {e})"))
        except Exception as e:  # keep going no matter what
            failed.append((url, f"Unexpected error: {e}"))
            print(f"   SKIPPED: unexpected error: {e}")
            with combined_path.open("a", encoding="utf-8") as f:
                f.write(block(i, url, f"(Not transcribed: unexpected error: {e})"))
        finally:
            if audio and not args.keep_audio:
                try:
                    audio.unlink()
                except OSError:
                    pass
        if i < len(links):
            time.sleep(DELAY_BETWEEN_REELS)

    print(f"\n{SEPARATOR}\nDone. Transcribed: {len(ok)}   Skipped: {len(failed)}")
    for url, reason in failed:
        print(f" - {url}\n   {reason}")
    print(f"\nCombined file: {combined_path}")
    print(f"Single files:  {TRANSCRIPT_DIR}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\nStopped by user.")
        sys.exit(130)
