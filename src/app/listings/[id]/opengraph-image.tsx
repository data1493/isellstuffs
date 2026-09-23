import {
  formatMoney,
  listingById,
  listings,
  stallById,
} from "@/lib/commerce";
import {
  listingFact,
  listingHubName,
  listingStatusLabel,
  listingTypeLabel,
} from "@/lib/listing-display";
import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const alt = "Listing on i sell stuffs";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return listings.map((listing) => ({ id: listing.id }));
}

export default async function ListingOpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = listingById(id);

  if (!listing) {
    return ogImage({
      kicker: "Listing",
      title: "That listing walked off",
      detail: "No SKU with that id on the table.",
    });
  }

  const stall = stallById(listing.stallId);

  return ogImage({
    kicker: `${listingTypeLabel(listing)} · ${listingHubName(listing)}`,
    title: listing.title,
    detail: `${formatMoney(listing.price)} · ${listingFact(listing)} · ${listingStatusLabel(listing)}`,
    footer: stall?.boothName ?? "the mall",
  });
}
