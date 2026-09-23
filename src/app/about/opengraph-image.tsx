import { ogContentType, ogImage, ogSize } from "@/lib/og-image";
import { site } from "@/lib/site";

export const alt = "The mall story — i sell stuffs";
export const size = ogSize;
export const contentType = ogContentType;

export default function AboutOpenGraphImage() {
  return ogImage({
    kicker: "The story",
    title: "This is a flea-market mall.",
    detail:
      "Independent stalls. Physical finds and digital files from the same table. Paid corners are labeled. Not a warehouse.",
    footer: site.mall,
  });
}
