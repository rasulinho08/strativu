import { motion, useReducedMotion } from "motion/react";
import { EASE } from "./Reveal";

/**
 * Platform overview: how objects relate.
 * Registers → Controls → Evidence, with Workflow and Reporting around them.
 * Connecting lines draw over ~500ms when the diagram enters the viewport.
 */
const NODES = [
  { id: "registers", x: 40, y: 120, w: 170, h: 96, title: "Registers", items: ["Risks", "Assets", "Vendors", "Processing"] },
  { id: "controls", x: 330, y: 120, w: 170, h: 96, title: "Controls", items: ["Shared control set", "Framework mapping", "Owners & cycles"] },
  { id: "evidence", x: 620, y: 120, w: 170, h: 96, title: "Evidence", items: ["Collectors", "Manual uploads", "Hash + timestamp"] },
  { id: "workflow", x: 330, y: 300, w: 170, h: 76, title: "Workflow", items: ["Tasks", "Reviews", "Exceptions"] },
  { id: "reporting", x: 620, y: 300, w: 170, h: 76, title: "Reporting", items: ["Audit packs", "SoA", "Board view"] },
];

const LINES = [
  "M210 168 H330",
  "M500 168 H620",
  "M415 216 V300",
  "M705 216 V300",
  "M500 338 H620",
  "M125 216 V338 H330",
];

export function SystemDiagram() {
  const reduce = useReducedMotion();
  return (
    <div className="rounded-[var(--radius)] border border-line bg-surface elev p-4 md:p-6 overflow-x-auto">
      <svg viewBox="0 0 830 400" className="w-full min-w-[640px] h-auto" role="img" aria-label="Strativu platform: registers feed controls, controls are proved by evidence; workflow and reporting sit underneath.">
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="fill-brand" />
          </marker>
        </defs>

        {/* audit trail band */}
        <rect x="40" y="40" width="750" height="36" rx="6" className="fill-brand-soft" />
        <text x="415" y="63" textAnchor="middle" className="fill-brand-ink" style={{ font: "500 11px var(--font-mono)", letterSpacing: ".12em" }}>
          APPEND-ONLY AUDIT TRAIL · EVERY WRITE, EVERY OBJECT, EVERY TENANT
        </text>

        {LINES.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            className="stroke-brand"
            strokeWidth="1.5"
            markerEnd="url(#arr)"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            whileInView={reduce ? undefined : { pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: EASE }}
          />
        ))}

        {NODES.map((n, i) => (
          <motion.g
            key={n.id}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: EASE }}
          >
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="6" className="fill-surface stroke-line" strokeWidth="1" />
            <text x={n.x + 14} y={n.y + 24} className="fill-ink" style={{ font: "600 13.5px var(--font-sans)", letterSpacing: "-.01em" }}>
              {n.title}
            </text>
            {n.items.map((it, j) => (
              <text key={it} x={n.x + 14} y={n.y + 44 + j * 16} className="fill-ink-2" style={{ font: "400 11px var(--font-mono)" }}>
                {it}
              </text>
            ))}
          </motion.g>
        ))}

        <text x="40" y="386" className="fill-ink-3" style={{ font: "400 10.5px var(--font-mono)", letterSpacing: ".08em" }}>
          GRC IS THE FIRST PRODUCT ON THIS MODEL · THE OBJECT GRAPH IS SHARED BY EVERY FUTURE PRODUCT
        </text>
      </svg>
    </div>
  );
}
