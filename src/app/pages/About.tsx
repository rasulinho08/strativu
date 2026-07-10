import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router";

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

const TEAM = [
  {
    name: "Daryanur Huseynov",
    role: "Founder & Chief Executive Officer",
    bio: "Daryanur leads Strativu's strategic vision, business development, and technology direction. With extensive experience in cybersecurity, governance, risk management, and enterprise security, he helps organizations build secure and resilient digital solutions.",
    initials: "DH",
    color: "from-[#0A0F2E] to-[#1a2550]",
    accent: "#00D4FF",
    linkedin: "https://www.linkedin.com/in/daryanur-huseynov-cissp-cism-oscp-956810106/",
    imgUrl: "/team/daryanur.png", // SİZİN ÜÇÜN ŞƏKİL YERİ
  },
  {
    name: "Nihad Taghiyev",
    role: "UniAz Project Lead",
    bio: "Nihad leads the UniAz platform, overseeing product strategy, technical coordination, and project execution. He focuses on building innovative educational technology solutions that deliver meaningful impact.",
    initials: "NT",
    color: "from-[#1a0A2E] to-[#2A1550]",
    accent: "#7C3AED",
    linkedin: "https://www.linkedin.com/in/nihad-taghiyev/",
    imgUrl: "/team/nihad.png", // SİZİN ÜÇÜN ŞƏKİL YERİ
  },
  {
    name: "Rasul Mamishov",
    role: "Lead Software Engineer",
    bio: "Rasul specializes in backend development, cloud technologies, APIs, and full-stack software engineering. He develops scalable applications and modern digital platforms using industry best practices.",
    initials: "RM",
    color: "from-[#0A1A0A] to-[#0D2A1A]",
    accent: "#10B981",
    linkedin: "https://www.linkedin.com/in/rasul-mamishov-6b9484336/",
    imgUrl: "/team/rasul.png", // SİZİN ÜÇÜN ŞƏKİL YERİ
  },
  {
    name: "Turan Huseynli",
    role: "GRC Project Lead & Business Analyst",
    bio: "Turan leads the Governance, Risk, and Compliance (GRC) initiative, bridging business objectives with technical implementation. He focuses on business analysis, stakeholder communication, and successful project delivery.",
    initials: "TH",
    color: "from-[#1A0A0A] to-[#2A1010]",
    accent: "#F59E0B",
    linkedin: "https://www.linkedin.com/in/turan-huseynli-b53360292/",
    imgUrl: "/team/turan.png", // SİZİN ÜÇÜN ŞƏKİL YERİ
  },
];

const PROCESS = [
  {
    num: "01",
    title: "Discovery & Planning",
    desc: "We begin by understanding your business objectives, technical requirements, and long-term goals to create a clear project roadmap.",
    img: "/projects/discovery.png",
  },
  {
    num: "02",
    title: "Architecture & Design",
    desc: "Our engineers design secure, scalable, and maintainable system architectures that provide a strong foundation for future growth.",
    img: "/projects/architecture%20.png",
  },
  {
    num: "03",
    title: "Development & Delivery",
    desc: "Using agile development practices, we build high-quality software through continuous integration, automated testing, and iterative delivery.",
    img: "/projects/development%20.png",
  },
  {
    num: "04",
    title: "Optimization & Support",
    desc: "After deployment, we continue optimizing performance, improving reliability, and supporting future enhancements as your business evolves.",
    img: "/projects/optimization%20.png",
  },
];

export default function About() {
  return (
    <div className="pt-24 pb-32 overflow-x-hidden" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      {/* ─── Hero ─── */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-24">
        <Reveal direction="up">
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-accent mb-5 block">About Us</span>
          <h1 className="text-5xl lg:text-7xl font-bold text-foreground tracking-tight leading-tight mb-8">
            Engineering Excellence.<br />
            <span className="text-muted-foreground font-normal">Business Impact.</span>
          </h1>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-12">
          <Reveal direction="left" delay={0.1}>
            <p className="text-2xl lg:text-3xl text-foreground font-medium leading-[1.4]">
              At Strativu, we believe technology should simplify business—not complicate it. Our mission is to deliver secure, scalable, and innovative digital solutions that help organizations achieve sustainable growth.
            </p>
          </Reveal>
          <Reveal direction="right" delay={0.2}>
            <div className="space-y-6 text-muted-foreground text-[16px] leading-relaxed">
              <p>
                By combining software engineering, cloud technologies, artificial intelligence, cybersecurity, and governance, we create modern technology solutions that solve real business challenges.
              </p>
              <p>
                Every project is built with long-term maintainability, security, and performance in mind, ensuring our clients receive solutions that continue to deliver value well beyond deployment.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="bg-[#0A0F2E] py-16 px-6 lg:px-8 mb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            { value: "2026", label: "Founded" },
            { value: "2+", label: "Projects Delivered" },
            { value: "11", label: "Engineering Specialists" },
            { value: "2", label: "Countries Served" },
          ].map((s, i) => (
            <Reveal key={s.label} direction="up" delay={i * 0.1}>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2 tracking-tight">{s.value}</div>
                <div className="text-white/40 text-[11px] font-semibold uppercase tracking-widest">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ─── Combined Process & Culture ─── */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-32">
        <Reveal direction="up" className="mb-20 text-center">
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-accent mb-4 block">How We Work</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            From Strategy to Long-Term Success
          </h2>
          <p className="text-muted-foreground text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
            Our process combines strategic planning, technical excellence, and close collaboration to deliver reliable software solutions that create lasting business value.
          </p>
        </Reveal>

        <div className="space-y-24 lg:space-y-32">
          {PROCESS.map((step, i) => {
            const isEven = i % 2 === 1;
            return (
              <div key={step.num} className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${isEven ? 'lg:flex-row-reverse' : ''}`}>
                <Reveal direction={isEven ? "right" : "left"} className="flex-1 w-full">
                  <div className="group overflow-hidden rounded-3xl aspect-[4/3] lg:aspect-square bg-secondary relative border border-border/50 shadow-2xl">
                    <img src={step.img} alt={step.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                    
                    {/* Badge on image */}
                    <div className="absolute top-6 left-6 w-14 h-14 bg-background/90 backdrop-blur-md rounded-2xl flex items-center justify-center border border-border/50 shadow-lg">
                      <span className="text-lg font-bold text-foreground">{step.num}</span>
                    </div>
                  </div>
                </Reveal>
                
                <Reveal direction={isEven ? "left" : "right"} className="flex-1 w-full space-y-6">
                  <div className="inline-flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-accent"></span>
                    <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent">Phase {step.num}</span>
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">{step.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          OUR TEAM
      ═══════════════════════════════════════════════════════ */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-24">
        <Reveal direction="up" className="mb-14">
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-accent mb-4 block">Our Team</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            The people behind<br />
            <span className="text-muted-foreground font-normal">the work.</span>
          </h2>
          <p className="text-muted-foreground text-lg mt-4 max-w-xl leading-relaxed">
            A small team of seasoned operators who have built products at the world's most successful technology companies.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((member, i) => (
            <Reveal key={member.name} direction="up" delay={i * 0.1}>
              <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-border/80 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500 flex flex-col h-full">
                {/* Avatar area */}
                <div className={`relative aspect-[4/3] bg-gradient-to-br ${member.color} flex items-center justify-center overflow-hidden group/team-img`}>
                  {member.imgUrl && (
                    <img 
                      src={member.imgUrl} 
                      alt={member.name} 
                      className="absolute inset-0 w-full h-full object-cover group-hover/team-img:scale-105 transition-transform duration-700" 
                    />
                  )}
                  {/* Decorative grid */}
                  <div
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{
                      backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                      backgroundSize: "30px 30px",
                    }}
                  />

                  {/* Initials circle (only visible if no image) */}
                  {!member.imgUrl && (
                    <div
                      className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-500"
                      style={{ background: `${member.accent}20`, border: `2px solid ${member.accent}40` }}
                    >
                      <span style={{ color: member.accent }}>{member.initials}</span>
                    </div>
                  )}

                  {/* Glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${member.accent}15 0%, transparent 70%)`,
                    }}
                  />
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-[16px] font-bold text-foreground mb-1 tracking-tight">{member.name}</h3>
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: member.accent }}>
                    {member.role}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{member.bio}</p>

                  {/* Social links */}
                  <div className="flex gap-3 mt-auto pt-2">
                    <a
                      href={member.linkedin}
                      className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-border transition-colors"
                      aria-label={`${member.name} LinkedIn`}
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-border transition-colors"
                        aria-label={`${member.name} Twitter`}
                      >
                        <Twitter className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>



      {/* ─── CTA ─── */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto">
        <Reveal direction="scale">
          <div className="bg-[#0A0F2E] rounded-3xl p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: "radial-gradient(ellipse at 0% 50%, rgba(0,212,255,0.3) 0%, transparent 60%)",
              }}
            />
            <div className="relative z-10">
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
                Join the team.
              </h3>
              <p className="text-white/50 max-w-md">
                We're always looking for exceptional engineers who want to work on the hardest problems in tech.
              </p>
            </div>
            <Link
              to="/contact"
              className="relative z-10 flex-shrink-0 group flex items-center gap-2 bg-accent text-[#0A0F2E] px-8 py-4 rounded-full font-bold text-[14px] hover:bg-white transition-all duration-300 shadow-xl shadow-accent/20"
            >
              Get in Touch
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
