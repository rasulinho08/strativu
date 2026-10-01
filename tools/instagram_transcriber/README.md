# Instagram Reel Transcriber (Windows CMD)

Paste public Instagram Reel links → get a word-for-word `.txt` transcript of each one.

- Downloads only the audio of **public** Reels (yt-dlp). No login, no private content.
- Transcribes on your own PC with Whisper (faster-whisper). Nothing is uploaded.
- One `.txt` per Reel plus one combined file. The URL and a separator go before each transcript.
- Private, deleted, or unavailable Reels are skipped with a clear message, and the rest keep going.

## Folder structure

```
instagram_transcriber\
├── instagram_transcriber.py   the tool
├── requirements.txt           Python packages
├── run.bat                    double-click launcher (optional)
├── downloads\                 temporary audio (auto-created, auto-cleaned)
└── transcripts\               results (auto-created)
    ├── 01_DdMbWKSNS_-.txt
    ├── 02_DdLkP1YN97v.txt
    └── all_transcripts_20261001_120000.txt
```

## One-time setup

1. Install **Python 3.11 or 3.12** from https://www.python.org/downloads/
   During setup, tick **"Add python.exe to PATH"**.
2. Put this folder on your Desktop, for example `C:\Users\<you>\Desktop\instagram_transcriber`.
3. Open **CMD** and run:

```bat
cd %USERPROFILE%\Desktop\instagram_transcriber
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

You don't need to install ffmpeg separately.

## Run

```bat
cd %USERPROFILE%\Desktop\instagram_transcriber
venv\Scripts\activate
python instagram_transcriber.py
```

Paste your links (one per line), then press **Enter on an empty line** to start.
You can also just double-click `run.bat`.

The first run downloads the Whisper model (`large-v3`, about 3 GB) once.

### Options

```bat
python instagram_transcriber.py --model small        :: faster, less accurate
python instagram_transcriber.py --language auto      :: auto-detect language (default: az)
python instagram_transcriber.py --language tr        :: Turkish, en = English, ru = Russian
python instagram_transcriber.py links.txt            :: read links from a file
python instagram_transcriber.py --keep-audio         :: keep the downloaded audio
```

| Model      | Speed on a normal laptop CPU | Accuracy |
|------------|------------------------------|----------|
| `small`    | fast                         | OK       |
| `medium`   | medium                       | good     |
| `large-v3` | ~1–2× the Reel length        | best (default) |

If you have an NVIDIA GPU with CUDA, it is used automatically.

## Troubleshooting

| Message | What to do |
|---|---|
| `rate-limiting requests (HTTP 429)` | Instagram is throttling you. Wait 15–30 minutes and run again with the skipped links. |
| `requires login` / `private` | The Reel is not public. The tool will not access it. |
| `not found` | The Reel was deleted, or the link is wrong. |
| Many Reels suddenly fail | Instagram changed something. Update yt-dlp: `pip install -U yt-dlp` |
| `No speech detected` | The Reel only has music or on-screen text. |
| DLL error when loading the model | Install the Microsoft Visual C++ Redistributable (x64): https://aka.ms/vs/17/release/vc_redist.x64.exe |
