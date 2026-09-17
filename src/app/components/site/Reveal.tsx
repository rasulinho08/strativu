import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.2, 0.6, 0.2, 1] as const;

/** Scroll reveal: 14px, opacity, once. Honours prefers-reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  const reduce = useReducedMotion();
  const Tag = (motion as any)[as] ?? motion.div;
  if (reduce) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

/** Staged entrance on load (hero). Children get 70ms stagger. */
export function Stagger({ children, className = "", step = 0.07 }: { children: ReactNode[]; className?: string; step?: number }) {
  const reduce = useReducedMotion();
  return (
    <div className={className}>
      {children.map((c, i) =>
        reduce ? (
          <div key={i}>{c}</div>
        ) : (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * step, ease: EASE }}
          >
            {c}
          </motion.div>
        )
      )}
    </div>
  );
}

export { EASE };
