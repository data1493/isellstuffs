import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const alt = "Order slip — i sell stuffs";
export const size = ogSize;
export const contentType = ogContentType;

export default function OrderSlipOpenGraphImage() {
  return ogImage({
    kicker: "Stand-in receipt",
    title: "One paid slip",
    detail:
      "Reconstructed from the listing ids on a paid tote. Not a warehouse invoice.",
    footer: "this browser",
  });
}
