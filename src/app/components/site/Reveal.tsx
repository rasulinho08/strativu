import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.25, 0.1, 0.25, 1] as const;

/** Scroll reveal: short fade + 10px rise, once. Honours prefers-reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
  y = 10,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
  y?: number;
}) {
  const reduce = useReducedMotion();
  const Tag = (motion as any)[as] ?? motion.div;
  if (reduce) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.45, delay: Math.min(delay, 0.2), ease: EASE }}
    >
      {children}
    </Tag>
  );
}

/** Staged entrance on load (hero). Children get a short stagger. */
export function Stagger({
  children,
  className = "",
  step = 0.06,
}: {
  children: ReactNode[];
  className?: string;
  step?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <div className={className}>
      {children.map((c, i) =>
        reduce ? (
          <div key={i}>{c}</div>
        ) : (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.04 + i * step, ease: EASE }}
          >
            {c}
          </motion.div>
        )
      )}
    </div>
  );
}

/** Headline. Plain h1; kept as a component so the hero markup stays the same. */
export function WordsIn({ text, className = "" }: { text: string; className?: string; delay?: number; emphasis?: number[] }) {
  return <h1 className={className}>{text}</h1>;
}

/** Simple entrance for the hero product shot. */
export function ScrollLift({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export { EASE };
