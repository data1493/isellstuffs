import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const alt = "Order slips — i sell stuffs";
export const size = ogSize;
export const contentType = ogContentType;

export default function OrdersOpenGraphImage() {
  return ogImage({
    kicker: "Stand-in receipts",
    title: "Order slips",
    detail:
      "Last paid totes in this browser. Reconstructed from checkout listing ids. No account. No warehouse invoice.",
    footer: "this browser",
  });
}
