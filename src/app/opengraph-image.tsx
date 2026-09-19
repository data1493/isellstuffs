import { ogContentType, ogImage, ogSize } from "@/lib/og-image";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.mall}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return ogImage({
    kicker: site.tagline,
    title: site.name,
    detail: site.description,
    footer: site.mall,
  });
}
