import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const alt = "Later pile — i sell stuffs";
export const size = ogSize;
export const contentType = ogContentType;

export default function SavedOpenGraphImage() {
  return ogImage({
    kicker: "Parked, not paid",
    title: "Later pile",
    detail:
      "Listings parked on this browser. Not the tote. No account. Sold and file-gone stay off the pile.",
    footer: "personal pile",
  });
}
