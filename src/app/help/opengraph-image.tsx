import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const alt = "How this mall works — i sell stuffs";
export const size = ogSize;
export const contentType = ogContentType;

export default function HelpOpenGraphImage() {
  return ogImage({
    kicker: "How to buy and sell",
    title: "How this mall works.",
    detail:
      "Browse the floor. Bag a tote. Mock-pay. Open a folder slip. List on a stall the mall already has.",
    footer: "one screen",
  });
}
