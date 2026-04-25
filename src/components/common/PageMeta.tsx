import { useEffect } from "react";

interface PageMetaProps {
  title: string;
  description: string;
  image?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

const DEFAULT_IMAGE = "/placeholder.svg";

export default function PageMeta({
  title,
  description,
  image = DEFAULT_IMAGE,
  noIndex = false,
  structuredData,
}: PageMetaProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attribute: "name" | "property", content: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, selector.match(/"([^"]+)"/)?.[1] ?? "");
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    const removeMeta = (selector: string) => {
      document.head.querySelector(selector)?.remove();
    };

    setMeta('meta[name="description"]', "name", description);
    setMeta('meta[property="og:title"]', "property", title);
    setMeta('meta[property="og:description"]', "property", description);
    setMeta('meta[property="og:image"]', "property", image);
    setMeta('meta[name="twitter:title"]', "name", title);
    setMeta('meta[name="twitter:description"]', "name", description);
    setMeta('meta[name="twitter:image"]', "name", image);
    setMeta('meta[name="robots"]', "name", noIndex ? "noindex, nofollow" : "index, follow");

    const scriptId = "iraqproperty-structured-data";
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }

    if (structuredData) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => {
      if (!structuredData) {
        removeMeta('meta[name="robots"]');
      }
    };
  }, [title, description, image, noIndex, structuredData]);

  return null;
}
