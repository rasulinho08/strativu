import { useState } from "react";
import { Link } from "react-router";
import { site } from "../../data/site";

/**
 * Logo slotu. public/logo.svg atılanda avtomatik göstərilir.
 * Fayl yoxdursa (və ya yüklənmirsə) aşağıdakı wordmark + mark göstərilir.
 */
export function LogoMark({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="1" y="1" width="22" height="22" rx="4" className="fill-brand" />
      <path d="M7 15.5 12 8l5 7.5H7Z" className="fill-on-brand" />
      <rect x="10.5" y="13" width="3" height="4.5" className="fill-brand" />
    </svg>
  );
}

export function Logo({ className = "", to = "/" }: { className?: string; to?: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = !!site.logo.src && !failed;
  return (
    <Link to={to} aria-label={`${site.name} home`} className={`inline-flex items-center gap-2.5 ${className}`}>
      {showImage ? (
        <>
          <img
            src={site.logo.src}
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
          <LogoMark />
          <span className="font-semibold text-[17px] tracking-[-0.01em] text-ink">{site.name}</span>
        </>
      )}
    </Link>
  );
}
