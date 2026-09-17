import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Logo } from "../site/Logo";
import { Btn, Container } from "../site/primitives";
import { ThemeToggle } from "../theme-toggle";
import { site } from "../../data/site";
import { frameworks } from "../../data/coverage";

const NAV = [
  { label: "Platform", to: "/platform" },
  { label: "Coverage", to: "/coverage" },
  { label: "Company", to: "/company/about" },
  { label: "Changelog", to: "/changelog" },
];

const FOOTER = [
  {
    title: "Platform",
    links: [
      { label: "Overview", to: "/platform" },
      { label: "GRC", to: "/platform/grc" },
      { label: "Architecture", to: "/platform/architecture" },
      { label: "Early access", to: "/early-access" },
    ],
  },
  {
    title: "Coverage",
    links: frameworks.slice(0, 6).map((f) => ({ label: f.id.split(" (")[0], to: `/coverage/${f.slug}` })).concat([{ label: "All frameworks", to: "/coverage" }]),
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/company/about" },
      { label: "Contact", to: "/company/contact" },
      { label: "Changelog", to: "/changelog" },
      { label: "Trust", to: "/trust" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Status", href: site.company.statusPage },
      { label: "LinkedIn", href: site.company.linkedin },
      { label: "GitHub", href: site.company.github },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "/legal/privacy" },
      { label: "Terms", to: "/legal/terms" },
      { label: "DPA", to: "/legal/dpa" },
    ],
  },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    if (!location.hash) window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }, [location.hash, location.pathname]);

  const solid = scrolled || !isHome || open;

  return (
    <div className="min-h-screen flex flex-col bg-ground text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-surface focus:px-3 focus:py-2 focus:rounded-[var(--radius)] focus:border focus:border-line">
        Skip to content
      </a>

      {/* ─── Header: transparent over hero, solid after 80px ─── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-[background-color,border-color,height] duration-200 border-b ${
          solid ? "bg-ground/90 backdrop-blur-md border-line h-14" : "bg-transparent border-transparent h-[68px]"
        }`}
        style={{ transitionTimingFunction: "var(--ease)" }}
      >
        <Container className="h-full flex items-center justify-between gap-6">
          <Logo />

          <nav aria-label="Primary" className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-[14px] rounded-[var(--radius)] transition-colors duration-150 ${isActive ? "text-ink font-medium" : "text-ink-2 hover:text-ink"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Link to="/company/contact" className="px-3 py-1.5 text-[14px] text-ink-2 hover:text-ink transition-colors duration-150">
              Contact
            </Link>
            <ThemeToggle className="text-ink-2 hover:text-ink hover:bg-surface-2" />
            <Btn to="/early-access" className="ml-1">Request early access</Btn>
          </div>

          <div className="flex lg:hidden items-center gap-1">
            <ThemeToggle className="text-ink-2 hover:text-ink hover:bg-surface-2" />
            <button
              className="p-2 -mr-2 text-ink rounded-[var(--radius)] hover:bg-surface-2 transition-colors"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="w-5 h-5" strokeWidth={1.75} /> : <Menu className="w-5 h-5" strokeWidth={1.75} />}
            </button>
          </div>
        </Container>

        <AnimatePresence>
          {open && (
            <motion.nav
              id="mobile-nav"
              aria-label="Mobile"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="lg:hidden absolute top-full inset-x-0 bg-ground border-b border-line"
            >
              <Container className="py-4 flex flex-col">
                {NAV.concat([{ label: "Contact", to: "/company/contact" }]).map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    className={({ isActive }) => `py-3 text-[17px] border-b border-line-soft ${isActive ? "text-ink font-medium" : "text-ink-2"}`}
                  >
                    {n.label}
                  </NavLink>
                ))}
                <Btn to="/early-access" size="lg" className="mt-4">Request early access</Btn>
              </Container>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main id="main" className="flex-1">{children}</main>

      {/* ─── Footer: five columns now, structured to grow ─── */}
      <footer className="border-t border-line bg-surface">
        <Container className="py-16 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.4fr_repeat(5,1fr)] gap-x-6 gap-y-10">
            <div className="col-span-2 md:col-span-3 lg:col-span-1">
              <Logo />
              <p className="mt-4 text-[14px] text-ink-2 max-w-[28ch]">{site.tagline}</p>
              <p className="mt-4 mono-label normal-case tracking-[0.04em]">{site.status.label} · {site.status.detail}</p>
            </div>
            {FOOTER.map((col) => (
              <div key={col.title}>
                <h4 className="mono-label mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {"to" in l && l.to ? (
                        <Link to={l.to} className="text-[14px] text-ink-2 hover:text-ink transition-colors duration-150">{l.label}</Link>
                      ) : (
                        <a href={(l as any).href} target="_blank" rel="noreferrer" className="text-[14px] text-ink-2 hover:text-ink transition-colors duration-150">{l.label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 pt-6 border-t border-line-soft flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-[11px] text-ink-3">
            <p>
              © {new Date().getFullYear()} {site.company.legalName} · {site.company.jurisdiction} · {site.company.registrationNo}
            </p>
            <p className="flex items-center gap-4">
              <a href={`mailto:${site.company.email}`} className="hover:text-ink transition-colors">{site.company.email}</a>
              <a href={site.company.statusPage} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-ink transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-ok" aria-hidden /> All systems normal
              </a>
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
