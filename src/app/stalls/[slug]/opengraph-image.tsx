import {
  isPhysicalListing,
  listingsByStall,
  stallBySlug,
  stalls,
} from "@/lib/commerce";
import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const alt = "Independent stall on i sell stuffs";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return stalls.map((stall) => ({ slug: stall.slug }));
}

export default async function StallOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return ogImage({
      kicker: "Stall",
      title: "That stall packed up",
      detail: "No booth with that slug.",
    });
  }

  const inventory = listingsByStall(stall.id);
  const physical = inventory.filter(isPhysicalListing).length;
  const digital = inventory.length - physical;

  return ogImage({
    kicker: stall.featured ? "Featured stall · labeled" : "Independent stall",
    title: stall.boothName,
    detail: `${stall.blurb} ${physical} objects · ${digital} files.`,
  });
}
