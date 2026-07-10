import { useRef, useEffect, useState } from "react";
import { Link } from "react-router";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowUpRight, Zap, Shield, Globe, ChevronDown, Plus, Minus, Server, Brain, Blocks, Quote, X } from "lucide-react";
/* ─── Animated Logo Assembly (4 blocks come together) ─── */
function AnimatedLogoAssembly() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const blockVariants = (dx: number, dy: number, delay: number) => ({
    hidden: { opacity: 0, x: dx, y: dy, scale: 0.7 },
    visible: {
      opacity: 1, x: 0, y: 0, scale: 1,
      transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="flex items-center justify-center"
    >
      <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.polygon points="10,10 60,10 45,35 10,35" fill="#0A0F2E" variants={blockVariants(-30, -30, 0)} />
        <motion.polygon points="60,10 90,10 90,40 55,40" fill="#00D4FF" variants={blockVariants(30, -30, 0.12)} />
        <motion.polygon points="10,60 45,60 30,85 10,85" fill="#00D4FF" variants={blockVariants(-30, 30, 0.24)} />
        <motion.polygon points="40,65 90,65 90,90 40,90" fill="#0A0F2E" variants={blockVariants(30, 30, 0.36)} />
        <motion.polygon points="45,35 55,40 55,60 45,60" fill="#0A0F2E" variants={blockVariants(0, 0, 0.48)} />
      </svg>
    </motion.div>
  );
}

/* ─── Scroll-reveal wrapper ─── */
function Reveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "scale";
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const dirs: Record<string, { x?: number; y?: number; scale?: number }> = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: -60 },
    right: { x: 60 },
    scale: { scale: 0.85, y: 20 },
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

/* ─── 3D Tilt Card ─── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale3d(1.02,1.02,1.02)`;
  };

  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

/* ─── Hero animated background: grid + floating orbs ─── */
function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Theme-aware gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.06] opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--color-accent) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glowing orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,212,255,0.18) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* Floating logo pieces in background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] dark:opacity-[0.04] opacity-[0.02]">
        <svg width="600" height="600" viewBox="0 0 100 100" fill="none">
          <polygon points="10,10 60,10 45,35 10,35" className="fill-foreground" />
          <polygon points="60,10 90,10 90,40 55,40" className="fill-foreground" />
          <polygon points="10,60 45,60 30,85 10,85" className="fill-foreground" />
          <polygon points="40,65 90,65 90,90 40,90" className="fill-foreground" />
          <polygon points="45,35 55,40 55,60 45,60" className="fill-foreground" />
        </svg>
      </div>

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />
    </div>
  );
}

/* ─── Stat counter ─── */
function StatItem({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      <div className="text-4xl lg:text-5xl font-bold text-foreground mb-2 tracking-tight">{value}</div>
      <div className="text-muted-foreground text-sm font-medium uppercase tracking-widest">{label}</div>
    </motion.div>
  );
}

function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ quote: "", author: "", role: "" });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("strativu_client_testimonials");
      if (stored) {
        setTestimonials(JSON.parse(stored));
      } else {
        localStorage.setItem("strativu_client_testimonials", JSON.stringify([]));
      }
    } catch (e) {}
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.quote || !formData.author) return;
    const updated = [...testimonials, formData];
    setTestimonials(updated);
    localStorage.setItem("strativu_client_testimonials", JSON.stringify(updated));
    setFormData({ quote: "", author: "", role: "" });
    setIsModalOpen(false);
  };

  return (
    <section className="py-24 px-6 lg:px-8 bg-background border-t border-border/30 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <Reveal direction="left">
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-accent mb-4 block">Testimonials</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              Trusted by the elite
            </h2>
          </Reveal>
          <Reveal direction="right" delay={0.2}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2 bg-secondary text-foreground px-6 py-3 rounded-full font-bold text-[13px] hover:bg-accent hover:text-[#0A0F2E] transition-colors shadow-sm border border-border/50"
            >
              Add Testimonial
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </Reveal>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {testimonials.map((t: any, i: number) => (
            <div key={i} className="snap-center shrink-0 w-[85vw] md:w-[400px] bg-secondary/40 border border-border/50 p-8 rounded-3xl relative">
              <Quote className="absolute top-8 right-8 w-12 h-12 text-accent/10 rotate-180" />
              <p className="text-foreground text-lg md:text-xl font-medium leading-relaxed mb-8 relative z-10">"{t.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
                  {t.author ? t.author.charAt(0) : "S"}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">{t.author}</h4>
                  <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border/50 rounded-3xl p-8 shadow-2xl"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold text-foreground mb-6">Add Testimonial</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2">Quote</label>
                  <textarea
                    required
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    className="w-full bg-secondary/50 border border-border/50 rounded-xl p-4 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all min-h-[100px]"
                    placeholder="What did they say?"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2">Author Name</label>
                  <input
                    required
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full bg-secondary/50 border border-border/50 rounded-xl p-4 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2">Role & Company</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-secondary/50 border border-border/50 rounded-xl p-4 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    placeholder="e.g. CEO, TechCorp"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-accent text-[#0A0F2E] font-bold py-4 rounded-xl hover:opacity-90 transition-opacity mt-4"
                >
                  Save Testimonial
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ─── Main Home Component ─── */
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        aria-label="Hero"
      >
        <HeroBackground />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-secondary/50 border border-border/50 rounded-full px-4 py-2 mb-8 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-foreground/70 text-[12px] font-semibold tracking-[0.2em] uppercase">
              Accepting 3 New Partners for 2026
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl lg:text-8xl font-bold text-foreground leading-[1.05] tracking-tight mb-6"
          >
            Engineering the{" "}
            <span
              className="relative inline-block"
              style={{
                background: "linear-gradient(135deg, #00D4FF 0%, #2563EB 50%, #7C3AED 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Extraordinary
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-muted-foreground text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Strativu partners with a select few clients each year to deliver elite software engineering.
            Precision-built systems. Senior-only teams. Zero compromises.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/contact"
              className="group flex items-center gap-2 bg-accent text-[#0A0F2E] px-8 py-4 rounded-full font-bold text-[15px] hover:bg-foreground hover:text-background transition-all duration-300 shadow-xl shadow-accent/20"
            >
              Partner with Strativu
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/work"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-[14px] font-medium transition-colors px-4 py-4"
            >
              View Our Work
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50"
        >
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-secondary/40 border-y border-border/50 py-16 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <StatItem value="2+" label="Years of Craft" delay={0} />
          <StatItem value="0" label="Enterprise Clients" delay={0.1} />
          <StatItem value="99%" label="On-time Delivery" delay={0.2} />
          <StatItem value="4" label="Spots Left — 2026" delay={0.3} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          LOGO ASSEMBLY SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <Reveal direction="left" className="flex-1">
            <div className="flex flex-col gap-6">
              <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-accent">Who We Are</span>
              <h2 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
                Engineering Tomorrow's<br />
                <span className="text-muted-foreground font-normal">Digital Infrastructure</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
                Strativu is a technology engineering company specializing in scalable software, cloud-native infrastructure, AI-powered solutions, and cybersecurity. We help organizations design, build, and modernize digital platforms that are secure, reliable, and built to grow with their business.
              </p>
              <Link
                to="/about"
                className="group inline-flex items-center gap-2 text-foreground font-semibold text-sm hover:text-accent transition-colors"
              >
                Learn about us
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>

          {/* Animated logo assembly */}
          <Reveal direction="scale" delay={0.2} className="flex-1 flex items-center justify-center">
            <div className="relative">
              <div className="w-64 h-64 flex items-center justify-center">
                <AnimatedLogoAssembly />
              </div>
              {/* Glow ring */}
              <div
                className="absolute inset-0 rounded-full opacity-20"
                style={{
                  background: "radial-gradient(circle, rgba(0,212,255,0.4) 0%, transparent 70%)",
                  filter: "blur(30px)",
                }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Global Scale",
                desc: "We architect systems that process billions of events for millions of users across the globe.",
                delay: 0.2,
                dir: "right" as const,
              },
            ].map((item) => (
              <Reveal key={item.title} direction={item.dir} delay={item.delay}>
                <TiltCard className="bg-card border border-border rounded-2xl p-8 h-full hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SERVICES & CAPABILITIES
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 lg:px-8 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/5 via-background to-background" />
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal direction="up" className="mb-16">
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-accent mb-4 block">Capabilities</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              Engineering solutions that power business growth
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Server className="w-8 h-8" />,
                title: "Cloud Architecture",
                desc: "We design secure, scalable, and resilient cloud infrastructures that support modern applications and enterprise workloads. From cloud migration to multi-region deployments, we build systems engineered for long-term reliability.",
                delay: 0,
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: "AI & Intelligent Systems",
                desc: "We develop AI-driven applications, intelligent automation, and machine learning solutions that help organizations improve efficiency, gain valuable insights, and make smarter business decisions.",
                delay: 0.1,
              },
              {
                icon: <Blocks className="w-8 h-8" />,
                title: "Platform Engineering",
                desc: "We build modern developer platforms, CI/CD pipelines, infrastructure automation, and cloud-native environments that accelerate software delivery while maintaining security and operational excellence.",
                delay: 0.2,
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Cybersecurity & Governance",
                desc: "Security is integrated into every stage of development. We help organizations strengthen cybersecurity, implement governance frameworks, and achieve compliance with industry standards.",
                delay: 0.3,
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Custom Software Development",
                desc: "We design and develop custom web platforms, enterprise applications, APIs, and backend systems tailored to each client's unique business requirements.",
                delay: 0.4,
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "DevOps & Automation",
                desc: "Our DevOps solutions automate infrastructure, deployments, monitoring, and operational workflows, enabling faster releases and more reliable software delivery.",
                delay: 0.5,
              },
            ].map((srv) => (
              <Reveal key={srv.title} direction="up" delay={srv.delay}>
                <div className="group relative bg-secondary/30 backdrop-blur-md border border-border/50 rounded-3xl p-8 hover:bg-secondary transition-colors duration-500 overflow-hidden h-full">
                  <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
                    {srv.icon}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-background border border-border/50 flex items-center justify-center text-accent mb-8 shadow-xl">
                    {srv.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">{srv.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{srv.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
            <Reveal direction="left">
              <div>
                <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-accent mb-4 block">Selected Work</span>
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                  Projects that define<br />the benchmark
                </h2>
              </div>
            </Reveal>
            <Reveal direction="right" delay={0.2}>
              <Link
                to="/work"
                className="group flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                View all work
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
              {
                num: "01",
                name: "UniAz Platform",
                title: "Unified Digital Education Ecosystem",
                desc: "Aiming to unite Azerbaijan's education sector into a single digital ecosystem, serving as a hub for applicants and students.",
                url: "https://uniaz.info/",
                tags: ["Education", "EdTech", "Platform"],
                delay: 0,
                imgUrl: "/projects/uniaz.png",
              },
              {
                num: "02",
                name: "GRC Strativu",
                title: "Governance, Risk & Compliance",
                desc: "An innovative enterprise GRC system featuring 15 entirely new modules to streamline organizational risk and security management.",
                url: "https://grcstrativu.vercel.app",
                tags: ["GRC", "Risk", "SaaS"],
                delay: 0.15,
                imgUrl: "/projects/grc.png",
              },
            ].map((project) => (
              <Reveal key={project.num} direction="up" delay={project.delay}>
                <TiltCard className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500">
                  {/* Screenshot placeholder */}
                  <div className="aspect-[16/9] bg-gradient-to-br from-[#0A0F2E] to-[#1a2550] relative overflow-hidden group/image">
                    {project.imgUrl && (
                      <img 
                        src={project.imgUrl} 
                        alt={project.name} 
                        className="absolute inset-0 w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-700" 
                      />
                    )}
                    {/* Floating Info Badge */}
                    <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
                      <div className="bg-[#0A0F2E]/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4">
                        <div className="text-white/20 text-4xl font-bold tracking-tighter">{project.num}</div>
                        <div className="text-left">
                          <div className="text-base font-bold text-[#00D4FF]">
                            {project.name}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/10 backdrop-blur-sm text-white/70 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-white/10">
                        {project.num}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">{project.name}</span>
                      <div className="flex gap-2">
                        {project.tags.map((t) => (
                          <span key={t} className="text-[9px] font-bold tracking-wide uppercase text-accent/70 bg-accent/5 px-2 py-1 rounded-md">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">{project.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5">{project.desc}</p>
                    <Link
                      to="/work"
                      className="group/btn inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors"
                    >
                      View Case Study
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════ */}
      <TestimonialsSection />



      {/* ═══════════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="relative py-40 px-6 lg:px-8 overflow-hidden bg-background border-t border-border/30">
        {/* Background effects */}
        <div className="absolute inset-0" aria-hidden="true">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Reveal direction="scale">
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-accent mb-6 block">
              Ready to build?
            </span>
            <h2 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight mb-8">
              Let's build the{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #00D4FF 0%, #2563EB 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                extraordinary.
              </span>
            </h2>
            <p className="text-muted-foreground text-lg mb-12 max-w-xl mx-auto leading-relaxed">
              Strativu partners with only a handful of clients each year to ensure absolute focus and excellence.
            </p>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-3 bg-accent text-[#0A0F2E] px-10 py-5 rounded-full font-bold text-[16px] hover:bg-foreground hover:text-background transition-all duration-300 shadow-2xl shadow-accent/20"
            >
              Secure Your Spot for 2026
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
