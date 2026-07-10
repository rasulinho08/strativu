import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Mail, MapPin, ArrowUpRight, ArrowUp, Plus, Minus } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";

const FAQ_DATA = [
  {
    q: "What is your typical engagement duration?",
    a: "Our standard engagements run between 3 to 12 months, depending on the complexity of the systems we are architecting.",
  },
  {
    q: "Do you integrate with our existing engineering team?",
    a: "Yes. We embed directly into your workflows, repositories, and communication channels. We act as an elite extension of your team.",
  },
  {
    q: "Who retains the intellectual property?",
    a: "You do. Upon completion and payment, 100% of the IP, code, and infrastructure definitions are transferred to your organization.",
  },
];

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "About Us", href: "/about" },
];

/* ─── Strativu SVG Logo Mark ─── */
function LogoMark({ size = 36, animated = false }: { size?: number; animated?: boolean }) {
  const variants = animated
    ? {
        hidden: { opacity: 0, scale: 0.6, rotate: -20 },
        visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }
    : {};

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
      className="inline-flex origin-center"
    >
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Top-left dark block */}
        <motion.polygon
          points="10,10 60,10 45,35 10,35"
          fill="#0A0F2E"
          className="dark:fill-white"
          variants={animated ? { hidden: { opacity: 0, x: -20, y: -20 }, visible: { opacity: 1, x: 0, y: 0, transition: { delay: 0, duration: 0.5 } } } : {}}
        />
        {/* Top-right cyan block */}
        <motion.polygon
          points="60,10 90,10 90,40 55,40"
          fill="#00D4FF"
          variants={animated ? { hidden: { opacity: 0, x: 20, y: -20 }, visible: { opacity: 1, x: 0, y: 0, transition: { delay: 0.1, duration: 0.5 } } } : {}}
        />
        {/* Middle-left cyan block */}
        <motion.polygon
          points="10,60 45,60 30,85 10,85"
          fill="#00D4FF"
          variants={animated ? { hidden: { opacity: 0, x: -20, y: 20 }, visible: { opacity: 1, x: 0, y: 0, transition: { delay: 0.2, duration: 0.5 } } } : {}}
        />
        {/* Bottom-right dark block */}
        <motion.polygon
          points="40,65 90,65 90,90 40,90"
          fill="#0A0F2E"
          className="dark:fill-white"
          variants={animated ? { hidden: { opacity: 0, x: 20, y: 20 }, visible: { opacity: 1, x: 0, y: 0, transition: { delay: 0.3, duration: 0.5 } } } : {}}
        />
        {/* Center connector */}
        <motion.polygon
          points="45,35 55,40 55,60 45,60"
          fill="#0A0F2E"
          className="dark:fill-white"
          variants={animated ? { hidden: { opacity: 0, scale: 0 }, visible: { opacity: 1, scale: 1, transition: { delay: 0.35, duration: 0.4 } } } : {}}
        />
      </svg>
    </motion.div>
  );
}

function Logo({ isHome, scrolled }: { isHome: boolean; scrolled: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3.5 group" aria-label="Strativu Home">
      <div className="group-hover:scale-105 transition-transform duration-300">
        <LogoMark size={56} />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-bold text-[28px] tracking-tight text-foreground transition-colors duration-500">Strativu</span>
        <span className="text-[12px] font-semibold text-accent tracking-[0.25em] uppercase mt-0.5">Engineering Elite</span>
      </div>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground antialiased selection:bg-accent/30 selection:text-foreground"
      style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
    >
      {/* ─── Navbar ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/90 backdrop-blur-xl border-b border-border/60 py-3 shadow-sm"
            : isHome
            ? "bg-transparent py-5"
            : "bg-background/95 backdrop-blur-md border-b border-border/40 py-4"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <Logo isHome={isHome} scrolled={scrolled} />

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1 ml-auto mr-8">
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.href;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`relative px-4 py-2 text-[14px] font-medium tracking-wide transition-colors duration-200 rounded-lg ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-secondary rounded-lg"
                      style={{ zIndex: -1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/contact"
              className={`group flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-300 ${
                isHome && !scrolled
                  ? "bg-white text-[#0A0F2E] hover:bg-accent hover:text-[#0A0F2E]"
                  : "bg-primary text-primary-foreground hover:bg-primary/85"
              } shadow-lg`}
            >
              Get Started
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              className="p-2 -mr-2 transition-colors text-foreground"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border p-6 lg:hidden shadow-2xl"
            >
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`px-4 py-3 text-lg font-semibold rounded-xl transition-colors ${
                      location.pathname === link.href
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/contact"
                  className="mt-4 bg-primary text-primary-foreground text-center py-3.5 rounded-xl font-bold text-sm tracking-wide"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── Main content ─── */}
      <main>{children}</main>

      {/* ─── Footer ─── */}
      <footer className="bg-[#0A0F2E] text-white py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-1 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-6">
                <LogoMark size={32} />
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-white text-[17px] tracking-tight">Strativu</span>
                  <span className="text-[9px] font-semibold text-accent tracking-[0.25em] uppercase mt-0.5">Engineering Elite</span>
                </div>
              </div>
              <p className="text-white/50 leading-relaxed text-sm max-w-xs">
                Elite software engineering studio partnering with global leaders to build the future of digital infrastructure.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-semibold mb-6 text-[11px] uppercase tracking-[0.2em] text-accent">Navigation</h4>
              <ul className="space-y-3 text-sm text-white/50">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-6 text-[11px] uppercase tracking-[0.2em] text-accent">Services</h4>
              <ul className="space-y-3 text-sm text-white/50">
                <li>Cloud Architecture</li>
                <li>AI &amp; ML Engineering</li>
                <li>Platform Engineering</li>
              </ul>
            </div>

            {/* Support & Contact */}
            <div>
              <h4 className="font-semibold mb-6 text-[11px] uppercase tracking-[0.2em] text-accent">Connect</h4>
              <div className="space-y-3 text-sm text-white/50 mb-6">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                  <a href="mailto:mamishovrasul028@gmail.com" className="hover:text-white transition-colors">mamishovrasul028@gmail.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>Azerbaijan, Baku</span>
                </div>
              </div>
              <h4 className="font-semibold mb-3 text-[11px] uppercase tracking-[0.2em] text-accent mt-6">Support</h4>
              <ul className="space-y-3 text-sm text-white/50">
                <li>
                  <button onClick={() => setIsFaqOpen(true)} className="hover:text-white transition-colors">FAQ</button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-white/30 font-medium tracking-widest uppercase">
              © {new Date().getFullYear()} Strativu Studio. Excellence by Design.
            </p>
            <div className="flex gap-6 text-[11px] text-white/30 font-medium tracking-widest uppercase">
              <a href="#" className="hover:text-white/70 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white/70 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Scroll to Top Button ─── */}
      <AnimatePresence>
        {scrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 p-3 bg-accent text-[#0A0F2E] rounded-full shadow-xl hover:bg-white hover:scale-110 transition-all duration-300"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── FAQ Modal ─── */}
      <AnimatePresence>
        {isFaqOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-border/50">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent mb-1 block">Support</span>
                  <h3 className="text-2xl font-bold text-foreground tracking-tight">FAQ</h3>
                </div>
                <button
                  onClick={() => setIsFaqOpen(false)}
                  className="p-2 bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  {FAQ_DATA.map((faq, i) => {
                    const isOpen = openFaqIndex === i;
                    return (
                      <div key={i} className="border border-border/60 rounded-2xl bg-background overflow-hidden">
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/50 transition-colors"
                        >
                          <span className="font-bold text-foreground text-[15px]">{faq.q}</span>
                          {isOpen ? <Minus className="w-4 h-4 text-accent flex-shrink-0 ml-4" /> : <Plus className="w-4 h-4 text-accent flex-shrink-0 ml-4" />}
                        </button>
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                        >
                          <div className="overflow-hidden">
                            <div className="p-5 pt-0 text-muted-foreground text-sm leading-relaxed">
                              {faq.a}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
