import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { ArrowUpRight, ExternalLink } from "lucide-react";

/* ─── Scroll-reveal wrapper ─── */
function Reveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  direction?: "up" | "left" | "right" | "scale";
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const dirs: Record<string, object> = {
    up: { y: 50 },
    left: { x: -60 },
    right: { x: 60 },
    scale: { scale: 0.9, y: 20 },
  };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dirs[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const PROJECTS = [
  {
    id: "01",
    client: "UniAz Platform",
    title: "Unified Digital Education Ecosystem",
    tagline: "All educational services in one platform",
    description: "UniAz aims to bring Azerbaijan's education sector together in a single digital ecosystem. It provides applicants, students, and graduates with the information and digital services they need, simplifying university and major searches, entrance score calculations, and announcements.",
    url: "https://uniaz.info/",
    tags: ["Education", "Platform", "EdTech", "Calculator"],
    metrics: [
      { value: "4+", label: "Modules" },
      { value: "Unified", label: "Ecosystem" },
      { value: "Fully", label: "Automated" },
    ],
    stack: ["React", "Node.js", "PostgreSQL", "TypeScript", "Tailwind CSS"],
    color: "from-[#0A0F2E] to-[#1a2550]",
    accentColor: "#00D4FF",
    screenshotBg: "from-[#06091A] via-[#0D1A4A] to-[#1a2550]",
    imgUrl: "/projects/uniaz.png",
  },
  {
    id: "02",
    client: "GRC Strativu",
    title: "Governance, Risk & Compliance",
    tagline: "Enterprise risk management software",
    description: "An innovative Governance, Risk, and Compliance (GRC) system featuring 15 entirely new modules. Currently in active development and pre-launch, it is built with cutting-edge technologies for advanced enterprise security and risk management.",
    url: "https://grcstrativu.vercel.app",
    tags: ["GRC", "Security", "Risk Management", "SaaS"],
    metrics: [
      { value: "15", label: "New Modules" },
      { value: "0", label: "Users (Pre-launch)" },
      { value: "100%", label: "Modern Stack" },
    ],
    stack: ["Next.js", "React", "Tailwind CSS", "TypeScript", "Prisma"],
    color: "from-[#0A1A0A] to-[#0D2A1A]",
    accentColor: "#10B981",
    screenshotBg: "from-[#06120A] via-[#0A1F12] to-[#0D2A1A]",
    imgUrl: "/projects/grc.png",
  },
];

export default function Work() {
  return (
    <div className="pt-24 pb-32 overflow-x-hidden" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      {/* ─── Page Header ─── */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-20">
        <Reveal direction="up">
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-accent mb-5 block">Selected Work</span>
          <h1 className="text-5xl lg:text-7xl font-bold text-foreground tracking-tight leading-tight mb-6">
            Building Technology That<br />
            <span className="text-muted-foreground font-normal">Creates Measurable Impact.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            We partner with organizations to design and build secure, scalable, and innovative digital solutions. Every project reflects our commitment to engineering excellence, collaboration, and delivering measurable business outcomes.
          </p>
        </Reveal>
      </div>

      {/* ─── Project Cards ─── */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        {PROJECTS.map((project, i) => (
          <Reveal key={project.id} direction="up" delay={i * 0.1}>
            <article className="group bg-card border border-border rounded-3xl overflow-hidden hover:border-border/80 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500">
              {/* ── Screenshot Area ── */}
              <div className={`relative aspect-[16/7] bg-gradient-to-br ${project.screenshotBg} overflow-hidden`}>
                {/* Decorative grid */}
                <div
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                  }}
                />

                {/* Browser chrome mockup */}
                <div className="absolute top-6 left-6 right-6 bottom-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden flex flex-col">
                  {/* Browser bar */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                      <div className="w-3 h-3 rounded-full bg-green-400/60" />
                    </div>
                    <div className="flex-1 mx-4 bg-white/10 rounded-md px-3 py-1 text-white/30 text-[11px] font-mono">
                      {project.url}
                    </div>
                  </div>
                  {/* Content area */}
                  <div className="flex-1 relative overflow-hidden group/image">
                    {project.imgUrl && (
                      <img 
                        src={project.imgUrl} 
                        alt={project.client} 
                        className="absolute inset-0 w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-700" 
                      />
                    )}
                    {/* Floating Info Badge */}
                    <div className="absolute bottom-6 right-6 z-10 pointer-events-none">
                      <div className="bg-[#0A0F2E]/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-5">
                        <div className="text-white/20 text-5xl font-bold tracking-tighter">{project.id}</div>
                        <div className="text-left">
                          <div
                            className="text-lg font-bold mb-0.5"
                            style={{ color: project.accentColor }}
                          >
                            {project.client}
                          </div>
                          <div className="text-white/70 text-xs font-medium">{project.tagline}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Glow overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: `radial-gradient(ellipse at 50% 50%, ${project.accentColor}15 0%, transparent 70%)`,
                  }}
                />
              </div>

              {/* ── Content Area ── */}
              <div className="p-8 lg:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Left: main info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground">
                        {project.client}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground">
                        Case Study {project.id}
                      </span>
                    </div>

                    <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 tracking-tight group-hover:text-accent transition-colors duration-300">
                      {project.title}
                    </h2>

                    <p className="text-muted-foreground leading-relaxed mb-6 text-[15px]">
                      {project.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-semibold tracking-wide text-foreground/70 bg-secondary px-3 py-1.5 rounded-full border border-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* More Details Button */}
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn inline-flex items-center gap-2.5 bg-foreground text-background px-6 py-3 rounded-full font-semibold text-[13px] hover:bg-accent hover:text-[#0A0F2E] transition-all duration-300 shadow-lg"
                    >
                      <ExternalLink className="w-4 h-4" />
                      More Details
                      <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>

                  {/* Right: metrics + stack */}
                  <div className="flex flex-col gap-8">
                    {/* Metrics */}
                    <div>
                      <h4 className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground mb-4">
                        Key Results
                      </h4>
                      <div className="space-y-4">
                        {project.metrics.map((m) => (
                          <div key={m.label} className="flex items-center justify-between py-3 border-b border-border/50">
                            <span className="text-muted-foreground text-sm">{m.label}</span>
                            <span
                              className="text-xl font-bold tracking-tight"
                              style={{ color: project.accentColor }}
                            >
                              {m.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tech Stack */}
                    <div>
                      <h4 className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground mb-4">
                        Tech Stack
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.stack.map((tech) => (
                          <span
                            key={tech}
                            className="text-[11px] font-mono font-medium text-foreground/60 bg-secondary border border-border px-2.5 py-1 rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {/* ─── Our Values ─── */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mt-32">
        <Reveal direction="up" className="mb-16">
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-accent mb-4 block">Our Values</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            The foundation of<br />
            <span className="text-muted-foreground font-normal">our engineering.</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Innovation",
              desc: "We continuously explore emerging technologies to solve complex business challenges with practical, future-ready solutions.",
            },
            {
              title: "Excellence",
              desc: "Quality is embedded in every stage of our engineering process, from architecture and development to deployment and long-term support.",
            },
            {
              title: "Collaboration",
              desc: "We work as an extension of our clients' teams, building strong partnerships through transparency, communication, and shared success.",
            },
            {
              title: "Trust",
              desc: "Security, reliability, accountability, and integrity are the foundation of every solution we deliver.",
            },
          ].map((val, i) => (
            <Reveal key={val.title} direction="up" delay={i * 0.1}>
              <div className="bg-secondary/30 backdrop-blur-md border border-border/50 rounded-2xl p-8 hover:bg-secondary transition-colors duration-500 h-full flex flex-col">
                <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center font-bold text-xl mb-6">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{val.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                  {val.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ─── Bottom CTA ─── */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mt-20">
        <Reveal direction="scale">
          <div className="bg-[#0A0F2E] rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.2) 0%, transparent 60%)",
              }}
            />
            <div className="relative z-10">
              <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-accent mb-4 block">
                Next Project
              </span>
              <h3 className="text-3xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                Could be yours.
              </h3>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                We have limited availability for 2026. Let's discuss what we can build together.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 bg-accent text-[#0A0F2E] px-8 py-4 rounded-full font-bold text-[14px] hover:bg-white transition-all duration-300 shadow-xl shadow-accent/20"
              >
                Start a Conversation
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
