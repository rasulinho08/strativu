import { useState } from "react";
import { Link } from "react-router";
import { site } from "../../data/site";

/**
 * Strativu logo.
 * LogoMark — göndərilən loqonun SVG yenidən çəkilişi (public/logo-mark.svg ilə eynidir).
 * Orijinal vektor faylınız varsa public/logo.svg atıb site.ts → logo.src yolunu yazın; o zaman <img> göstərilir.
 */
export function LogoMark({ size = 26, className = "" }: { size?: number; className?: string }) {
  const id = "strativu-g";
  return (
    <svg width={size} height={size * 0.92} viewBox="0 0 100 92" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3FD2FF" />
          <stop offset="0.55" stopColor="#1A9BFF" />
          <stop offset="1" stopColor="#0A5FD8" />
        </linearGradient>
      </defs>
      <path d="M50 10 C41 32 27 50 13 60 C8 66 4 76 1 86 L99 86 C96 76 92 66 87 60 C73 50 59 32 50 10 Z" fill={`url(#${id})`} />
      <path d="M28 80 C40 62 60 60 99 86 L1 86 C8 84 18 82 28 80 Z" fill="#0A5FD8" opacity=".55" />
      <g fill="none" stroke="#0B1220" strokeWidth="4.2" strokeLinecap="round">
        <path d="M50 12 C46 34 40 50 13 62" />
        <path d="M50 12 C54 34 60 50 87 62" />
        <path d="M13 62 C34 52 66 52 87 62" />
        <path d="M50 12 C48 40 44 60 30 80" />
        <path d="M50 12 C52 40 56 60 70 80" />
      </g>
      <g fill="#3FD2FF" stroke="#0B1220" strokeWidth="3.2">
        <circle cx="50" cy="12" r="7.5" />
        <circle cx="13" cy="62" r="7.5" />
        <circle cx="87" cy="62" r="7.5" />
      </g>
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-semibold text-[19px] leading-none tracking-[-0.02em] bg-clip-text text-transparent ${className}`}
      style={{ backgroundImage: "linear-gradient(90deg, #1A9BFF 0%, #0A5FD8 100%)" }}
    >
      Strativu
    </span>
  );
}

export function Logo({ className = "", to = "/" }: { className?: string; to?: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = !!site.logo.src && !failed;
  return (
    <Link to={to} aria-label={`${site.name} home`} className={`inline-flex items-center gap-2 ${className}`}>
      {showImage ? (
        <>
          <img
            src={site.logo.src!}
            alt={site.name}
            height={site.logo.height}
            style={{ height: site.logo.height, width: "auto" }}
            className={site.logo.darkSrc ? "dark:hidden" : ""}
            onError={() => setFailed(true)}
          />
          {site.logo.darkSrc && (
            <img src={site.logo.darkSrc} alt="" aria-hidden height={site.logo.height} style={{ height: site.logo.height, width: "auto" }} className="hidden dark:block" />
          )}
        </>
      ) : (
        <>
          <LogoMark size={28} />
          <Wordmark />
        </>
      )}
    </Link>
  );
}
