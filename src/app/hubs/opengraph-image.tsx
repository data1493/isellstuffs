import { hubFloorList } from "@/lib/commerce";
import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const alt = "The aisles — i sell stuffs";
export const size = ogSize;
export const contentType = ogContentType;

export default function HubsOpenGraphImage() {
  return ogImage({
    kicker: "The map",
    title: "The aisles. Pick one with a rule.",
    detail: hubFloorList(),
  });
}
