import { useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight, Mail, MapPin, Clock, CheckCircle2, ArrowUpRight } from "lucide-react";
import { useForm, ValidationError } from '@formspree/react';

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

const INQUIRY_TYPES = [
  "New Project Inquiry",
  "Strategic Partnership",
  "Talent & Careers",
  "Press & Media",
];

const INFO_ITEMS = [
  {
    icon: <Mail className="w-5 h-5" />,
    label: "Email",
    value: "mamishovrasul028@gmail.com",
    sub: "We respond within 24 hours",
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    label: "Offices",
    value: "Azerbaijan, Baku",
    sub: "Global presence, local expertise",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    label: "Availability",
    value: "3 spots remaining for 2026",
    sub: "We partner with a select few clients",
  },
];

export default function Contact() {
  const [state, handleSubmit] = useForm("xvzjezqa");
  const [activeType, setActiveType] = useState(INQUIRY_TYPES[0]);
  const [focused, setFocused] = useState<string | null>(null);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
    >
      {/* ─── Dark Hero Header ─── */}
      <div className="relative bg-[#0A0F2E] pt-36 pb-24 px-6 lg:px-8 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0" aria-hidden="true">
          <div
            className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, rgba(0,212,255,0.4) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full opacity-15"
            style={{
              background: "radial-gradient(circle, rgba(37,99,235,0.5) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-accent mb-5 block">
              Get in Touch
            </span>
            <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-tight mb-6">
              Let's build something<br />
              <span
                style={{
                  background: "linear-gradient(135deg, #00D4FF 0%, #2563EB 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                remarkable.
              </span>
            </h1>
            <p className="text-white/50 text-lg max-w-xl leading-relaxed">
              Tell us about your project. We'll respond within 24 hours and schedule a discovery call if there's a fit.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="bg-background px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* ── Left: Info ── */}
          <div className="lg:col-span-2 space-y-8">
            <Reveal direction="left">
              <div className="space-y-6">
                {INFO_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="flex gap-4 p-5 bg-card border border-border rounded-2xl hover:border-accent/20 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-1">
                        {item.label}
                      </div>
                      <div className="text-foreground font-semibold text-sm mb-0.5">{item.value}</div>
                      <div className="text-muted-foreground text-[12px]">{item.sub}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Reveal>

            {/* Process steps */}
            <Reveal direction="left" delay={0.3}>
              <div className="bg-[#0A0F2E] rounded-2xl p-6 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: "radial-gradient(ellipse at 0% 0%, rgba(0,212,255,0.3) 0%, transparent 60%)",
                  }}
                />
                <div className="relative z-10">
                  <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent mb-5">
                    What Happens Next
                  </h4>
                  <div className="space-y-4">
                    {[
                      { step: "01", text: "We review your inquiry within 24 hours" },
                      { step: "02", text: "Schedule a 30-min discovery call" },
                      { step: "03", text: "Receive a tailored proposal within 5 days" },
                    ].map((s) => (
                      <div key={s.step} className="flex items-start gap-3">
                        <span className="text-accent font-bold text-[12px] mt-0.5 flex-shrink-0">{s.step}</span>
                        <span className="text-white/60 text-sm leading-relaxed">{s.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* ── Right: Form ── */}
          <div className="lg:col-span-3">
            <Reveal direction="right">
              {state.succeeded ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-card border border-border rounded-3xl p-12 text-center"
                >
                  <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                    Message Received
                  </h3>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Thank you for reaching out. We'll review your inquiry and get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <div className="bg-card border border-border rounded-3xl p-8 lg:p-10">
                  <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">Start a Conversation</h3>
                  <p className="text-muted-foreground text-sm mb-8">
                    Fill out the form below and we'll be in touch shortly.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name + Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {[
                        { id: "name", label: "Full Name", type: "text", placeholder: "Jane Doe" },
                        { id: "email", label: "Work Email", type: "email", placeholder: "jane@company.com" },
                      ].map((field) => (
                        <div key={field.id}>
                          <label
                            htmlFor={field.id}
                            className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2.5 block"
                          >
                            {field.label}
                          </label>
                          <input
                            id={field.id}
                            name={field.id}
                            type={field.type}
                            placeholder={field.placeholder}
                            required
                            onFocus={() => setFocused(field.id)}
                            onBlur={() => setFocused(null)}
                            className={`w-full bg-background border px-5 py-3.5 rounded-xl text-foreground text-sm placeholder:text-muted-foreground/50 outline-none transition-all duration-200 ${
                              focused === field.id
                                ? "border-accent/60 shadow-sm shadow-accent/10"
                                : "border-border hover:border-border/80"
                            }`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Company */}
                    <div>
                      <label
                        htmlFor="company"
                        className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2.5 block"
                      >
                        Company
                      </label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        placeholder="Acme Corp"
                        onFocus={() => setFocused("company")}
                        onBlur={() => setFocused(null)}
                        className={`w-full bg-background border px-5 py-3.5 rounded-xl text-foreground text-sm placeholder:text-muted-foreground/50 outline-none transition-all duration-200 ${
                          focused === "company"
                            ? "border-accent/60 shadow-sm shadow-accent/10"
                            : "border-border hover:border-border/80"
                        }`}
                      />
                    </div>

                    {/* Inquiry Type — pill selector */}
                    <div>
                      <label className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3 block">
                        Inquiry Type
                      </label>
                      <input type="hidden" name="inquiryType" value={activeType} />
                      <div className="flex flex-wrap gap-2">
                        {INQUIRY_TYPES.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setActiveType(type)}
                            className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all duration-200 ${
                              activeType === type
                                ? "bg-foreground text-background"
                                : "bg-secondary text-muted-foreground hover:bg-border hover:text-foreground border border-border"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget */}
                    <div>
                      <label
                        htmlFor="budget"
                        className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2.5 block"
                      >
                        Project Budget
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        onFocus={() => setFocused("budget")}
                        onBlur={() => setFocused(null)}
                        className={`w-full bg-background border px-5 py-3.5 rounded-xl text-foreground text-sm outline-none transition-all duration-200 appearance-none cursor-pointer ${
                          focused === "budget"
                            ? "border-accent/60 shadow-sm shadow-accent/10"
                            : "border-border hover:border-border/80"
                        }`}
                      >
                        <option value="">Select a range...</option>
                        <option>$50K – $100K</option>
                        <option>$100K – $250K</option>
                        <option>$250K – $500K</option>
                        <option>$500K+</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2.5 block"
                      >
                        Project Brief
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        placeholder="Tell us about what you're building, the challenges you're facing, and what success looks like..."
                        onFocus={() => setFocused("message")}
                        onBlur={() => setFocused(null)}
                        className={`w-full bg-background border px-5 py-3.5 rounded-xl text-foreground text-sm placeholder:text-muted-foreground/50 outline-none transition-all duration-200 resize-none ${
                          focused === "message"
                            ? "border-accent/60 shadow-sm shadow-accent/10"
                            : "border-border hover:border-border/80"
                        }`}
                      />
                    </div>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={state.submitting}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full bg-[#0A0F2E] text-white py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-3 hover:bg-accent hover:text-[#0A0F2E] transition-all duration-300 shadow-xl shadow-[#0A0F2E]/20 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {state.submitting ? "Sending..." : "Send Inquiry"}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>

                    <p className="text-center text-[11px] text-muted-foreground">
                      By submitting, you agree to our{" "}
                      <a href="#" className="underline hover:text-foreground transition-colors">Privacy Policy</a>.
                      We never share your information.
                    </p>
                  </form>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
