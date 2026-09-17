import { Btn, Container } from "./primitives";
import { Reveal } from "./Reveal";
import { site } from "../../data/site";

/** Full-bleed brand statement, one button, no form. */
export function ClosingCTA({
  title = "Every claim on this site should survive “can you show me?”",
  body = "That is the constraint we build under. If you run a security or compliance programme and want to shape what the GRC product becomes, early access is open to a small number of teams.",
}: { title?: string; body?: string }) {
  return (
    <section className="bg-brand text-on-brand py-24 md:py-40">
      <Container>
        <Reveal>
          <div className="max-w-[880px]">
            <p className="eyebrow !text-on-brand/70 mb-6">{site.status.label} · {site.status.detail}</p>
            <h2 className="text-[34px] md:text-[48px] lg:text-[60px] leading-[1.02] tracking-[-0.03em] !text-on-brand">{title}</h2>
            <p className="mt-6 text-[17px] md:text-[19px] text-on-brand/80 measure">{body}</p>
            <div className="mt-10">
              <Btn to="/early-access" size="lg" arrow className="!bg-on-brand !text-brand hover:!bg-on-brand/90">
                Request early access
              </Btn>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
