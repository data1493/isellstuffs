import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const alt = "Your table tonight — i sell stuffs";
export const size = ogSize;
export const contentType = ogContentType;

export default function SellDeskOpenGraphImage() {
  return ogImage({
    kicker: "One stall · no account",
    title: "Your table tonight.",
    detail:
      "Folding Table Tuesday desk. List something, check paper payouts, read the cut, or rewrite the booth card.",
    footer: "stallholder home",
  });
}
