import { site } from "../../data/site";
import { logoWall, stats, testimonials } from "../../data/proof";
import { Container } from "./primitives";
import { Reveal } from "./Reveal";

/**
 * MOCK sübut blokları. Hər biri site.ts → proof ilə söndürülə bilər.
 * Söndürüləndə yerində boşluq qalmır; layout dəyişmir.
 */

export function LogoWall() {
  if (!site.proof.logoWall) return null;
  return (
    <div className="py-12 md:py-14 border-y border-line">
      <Container>
        <Reveal>
          <p className="mono-label text-center mb-8">{logoWall.heading}</p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-6 items-center">
            {logoWall.logos.map((name) => (
              <li key={name} className="flex items-center justify-center">
                <span className="font-semibold text-[15px] tracking-[-0.01em] text-ink-3 select-none whitespace-nowrap" aria-label={name}>
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </div>
  );
}

export function StatsRow() {
  if (!site.proof.stats) return null;
  return (
    <Reveal>
      <dl className="grid grid-cols-2 lg:grid-cols-4 border border-line rounded-[var(--radius)] bg-surface overflow-hidden">
        {stats.map((s, i) => (
          <div key={s.label} className={`p-6 md:p-7 ${i % 2 === 1 ? "border-l border-line-soft" : ""} ${i >= 2 ? "border-t lg:border-t-0 border-line-soft" : ""} ${i >= 1 ? "lg:border-l lg:border-line-soft" : ""}`}>
            <dd className="font-semibold text-[34px] md:text-[40px] leading-none tracking-[-0.03em] text-ink font-mono">{s.value}</dd>
            <dt className="mt-3 text-[14px] text-ink-2 leading-[1.45]">{s.label}</dt>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}

export function TestimonialBand() {
  if (!site.proof.testimonials) return null;
  return (
    <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {testimonials.map((t, i) => (
        <Reveal as="li" key={i} delay={i * 0.06}>
          <figure className="h-full flex flex-col rounded-[var(--radius)] border border-line bg-surface p-6">
            <blockquote className="text-[16px] text-ink leading-[1.55] flex-1">“{t.quote}”</blockquote>
            <figcaption className="mt-6 pt-4 border-t border-line-soft">
              <div className="text-[14px] font-medium text-ink">{t.name}</div>
              <div className="mono-label normal-case tracking-[0.04em] mt-0.5">{t.company}</div>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </ul>
  );
}
