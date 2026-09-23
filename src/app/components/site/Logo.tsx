import { Link } from "react-router";
import { site } from "../../data/site";

/**
 * Strativu logo.
 * Light theme: full PNG logo (mark + wordmark) from public/brand/logo-full.png.
 * Dark theme: the mark alone plus a CSS wordmark, because the PNG wordmark is dark blue
 * and disappears on a dark background. Set site.logo.darkSrc to a light-on-dark file to
 * override this fallback.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-semibold text-[19px] leading-none tracking-[-0.02em] bg-clip-text text-transparent ${className}`}
      style={{ backgroundImage: "linear-gradient(90deg, #5FDBFF 0%, #4C93FF 100%)" }}
    >
      Strativu
    </span>
  );
}

export function Logo({ className = "", to = "/" }: { className?: string; to?: string }) {
  const h = site.logo.height;
  return (
    <Link to={to} aria-label={`${site.name} home`} className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={site.logo.src}
        alt={site.name}
        height={h}
        width={Math.round(h * 4.19)}
        style={{ height: h, width: "auto" }}
        className="dark:hidden"
        decoding="async"
      />
      {site.logo.darkSrc ? (
        <img
          src={site.logo.darkSrc}
          alt={site.name}
          height={h}
          style={{ height: h, width: "auto" }}
          className="hidden dark:block"
          decoding="async"
        />
      ) : (
        <span className="hidden items-center gap-2 dark:inline-flex">
          <img src={site.logo.mark} alt="" aria-hidden height={h} style={{ height: h, width: "auto" }} decoding="async" />
          <Wordmark />
        </span>
      )}
    </Link>
  );
}
