import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1280px] px-5 md:px-6 ${className}`}>{children}</div>;
}

/** Section rhythm: 128px desktop, 80px mobile. Never compress. */
export function Section({
  children,
  className = "",
  id,
  tone = "ground",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "ground" | "surface" | "brand";
}) {
  const tones = {
    ground: "",
    surface: "bg-surface border-y border-line",
    brand: "bg-brand text-on-brand",
  };
  return (
    <section id={id} className={`py-20 md:py-32 scroll-mt-16 ${tones[tone]} ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow mb-4 ${className}`}>{children}</p>;
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={`${align === "center" ? "text-center mx-auto" : ""} max-w-[720px] mb-12 md:mb-16`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-[28px] md:text-[34px] lg:text-[40px] text-ink">{title}</h2>
      {lead && <p className="mt-4 text-[17px] md:text-[18px] text-ink-2 measure">{lead}</p>}
    </div>
  );
}

type BtnProps = {
  to?: string;
  href?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  className?: string;
  arrow?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

export function Btn({ to, href, children, variant = "primary", size = "md", className = "", arrow, type, disabled, onClick }: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius)] transition-colors duration-150 arrow-shift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60 disabled:pointer-events-none";
  const sizes = { md: "h-10 px-4 text-[14px]", lg: "h-12 px-6 text-[15px]" };
  const variants = {
    primary: "bg-brand text-on-brand hover:bg-brand-ink",
    secondary: "border border-line bg-surface text-ink hover:border-ink-3 hover:bg-surface-2",
    ghost: "text-ink-2 hover:text-ink",
  };
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  const inner = (
    <>
      {children}
      {arrow && <ArrowRight className="w-4 h-4" strokeWidth={1.75} />}
    </>
  );
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  if (href) return <a href={href} className={cls}>{inner}</a>;
  return (
    <button type={type ?? "button"} className={cls} disabled={disabled} onClick={onClick}>
      {inner}
    </button>
  );
}

export function TextLink({ to, children, className = "" }: { to: string; children: ReactNode; className?: string }) {
  return (
    <Link to={to} className={`link-line arrow-shift inline-flex items-center gap-1.5 text-[14px] font-medium text-brand-ink ${className}`}>
      {children}
      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
    </Link>
  );
}

export function StatusChip({ status }: { status: "supported" | "in-progress" | "planned" }) {
  const map = {
    supported: "bg-brand-soft text-brand-ink border-brand-line",
    "in-progress": "bg-surface-2 text-ink-2 border-line",
    planned: "bg-transparent text-ink-3 border-dashed border-line",
  };
  const label = { supported: "Supported", "in-progress": "Mapping", planned: "Planned" };
  return (
    <span className={`inline-flex items-center h-[22px] px-2 rounded-[var(--radius)] border font-mono text-[10px] tracking-[0.1em] uppercase ${map[status]}`}>
      {label[status]}
    </span>
  );
}

export function PageHeader({ eyebrow, title, lead, children }: { eyebrow: string; title: ReactNode; lead?: ReactNode; children?: ReactNode }) {
  return (
    <header className="pt-32 md:pt-40 pb-16 md:pb-20 border-b border-line">
      <Container>
        <div className="max-w-[760px]">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-[36px] md:text-[48px] lg:text-[56px] text-ink tracking-[-0.025em]">{title}</h1>
          {lead && <p className="mt-5 text-[18px] md:text-[19px] text-ink-2 measure">{lead}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </Container>
    </header>
  );
}

export function Prose({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`prose-strativu measure text-[16.5px] text-ink-2 [&_h2]:text-ink [&_h2]:text-[24px] [&_h2]:mt-12 [&_h2]:mb-4 [&_h3]:text-ink [&_h3]:text-[18px] [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:pl-5 [&_ul]:list-disc [&_li]:mb-1.5 [&_strong]:text-ink [&_code]:font-mono [&_code]:text-[0.86em] [&_code]:bg-surface-2 [&_code]:px-1 [&_code]:rounded-[3px] ${className}`}>
      {children}
    </div>
  );
}
