import { Btn, Container } from "./primitives";
import { Reveal } from "./Reveal";
import { site } from "../../data/site";

/**
 * Closing statement. One primary action, one secondary.
 * `stage` (home page): a tall, transparent section — the 3D mark flies back to centre above the text.
 */
export function ClosingCTA({
  title = "Every claim on this site should survive “can you show me?”",
  body = "That is the constraint we build under. If you run a security or compliance programme and want to shape what the GRC product becomes, early access is open to a small number of teams.",
  stage = false,
}: {
  title?: string;
  body?: string;
  stage?: boolean;
}) {
  const inner = (
    <Reveal>
      <div className="mx-auto max-w-[860px] text-center">
        <p className="chapter">
          <b>{site.status.label}</b> · {site.status.detail}
        </p>
        <h2 className="t-h1 mt-6 text-ink">{title}</h2>
        <p className="mx-auto mt-6 max-w-[60ch] text-[17px] leading-[1.65] text-ink-2">{body}</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Btn to="/early-access" size="lg" arrow>
            Request early access
          </Btn>
          <Btn to="/company/contact" size="lg" variant="secondary">
            Talk to us
          </Btn>
        </div>
      </div>
    </Reveal>
  );

  if (stage) {
    return (
      <section data-logo-stage className="relative flex min-h-[100svh] flex-col justify-end pb-20 pt-[48svh] md:pb-28">
        <Container>{inner}</Container>
      </section>
    );
  }
  return (
    <section className="relative isolate overflow-hidden border-t border-line py-24 md:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
        style={{ background: "radial-gradient(closest-side, var(--glow-1), transparent 72%)" }}
      />
      <Container>{inner}</Container>
    </section>
  );
}
