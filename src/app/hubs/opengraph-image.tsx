import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const alt = "Four aisles — i sell stuffs";
export const size = ogSize;
export const contentType = ogContentType;

export default function HubsOpenGraphImage() {
  return ogImage({
    kicker: "The map",
    title: "Four aisles. Pick one with a rule.",
    detail: "Yard Sale, Closet Overflow, Garage Tech, and Download Stall.",
  });
}
