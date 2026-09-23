import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const alt = "Search the tables — i sell stuffs";
export const size = ogSize;
export const contentType = ogContentType;

export default function SearchOpenGraphImage() {
  return ogImage({
    kicker: "Lost and found",
    title: "Search the tables",
    detail:
      "Look up a title, a stall, a hub, or physical versus digital. Same catalog as the concourse.",
  });
}
