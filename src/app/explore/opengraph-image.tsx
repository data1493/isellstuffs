import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const alt = "Explore the concourse — i sell stuffs";
export const size = ogSize;
export const contentType = ogContentType;

export default function ExploreOpenGraphImage() {
  return ogImage({
    kicker: "General concourse",
    title: "Explore the mall",
    detail:
      "Filter by hub or physical/digital. Paid corners are labeled. Sold stays on the floor.",
  });
}
