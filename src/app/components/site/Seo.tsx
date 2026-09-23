import { useEffect } from "react";
import { useLocation } from "react-router";
import { site } from "../../data/site";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Per-route <title>, description, canonical and Open Graph tags.
 * Call once at the top of each page component.
 */
export function usePageMeta(title: string | null, description: string) {
  const { pathname } = useLocation();
  useEffect(() => {
    const full = title ? `${title} · ${site.name}` : `${site.name} | ${site.tagline.replace(/\.$/, "")}`;
    const url = `${site.domain}${pathname}`;
    document.title = full;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", full);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("name", "twitter:title", full);
    upsertMeta("name", "twitter:description", description);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [title, description, pathname]);
}
