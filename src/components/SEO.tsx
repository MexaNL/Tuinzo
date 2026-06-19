import { useEffect } from "react";

interface Props {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "product" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const setMeta = (selector: string, attr: string, value: string) => {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    const [, name] = selector.match(/\[(?:name|property)="([^"]+)"\]/) ?? [];
    if (name) el.setAttribute(selector.includes("property") ? "property" : "name", name);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

export const SEO = ({ title, description, canonical, image, type = "website", jsonLd }: Props) => {
  useEffect(() => {
    document.title = title.length > 60 ? title.slice(0, 57) + "…" : title;
    if (description) setMeta('meta[name="description"]', "content", description.slice(0, 160));
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:type"]', "content", type);
    if (description) setMeta('meta[property="og:description"]', "content", description);
    if (image) setMeta('meta[property="og:image"]', "content", image);
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");

    let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonical ?? window.location.href);

    document.head.querySelectorAll('script[data-seo-jsonld]').forEach((n) => n.remove());
    if (jsonLd) {
      const list = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      list.forEach((data) => {
        const s = document.createElement("script");
        s.setAttribute("type", "application/ld+json");
        s.setAttribute("data-seo-jsonld", "true");
        s.textContent = JSON.stringify(data);
        document.head.appendChild(s);
      });
    }
  }, [title, description, canonical, image, type, JSON.stringify(jsonLd)]);

  return null;
};

export const breadcrumbJsonLd = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: it.url,
  })),
});
