"use server";

import { revalidatePath } from "next/cache";

import { stallById } from "@/lib/commerce";
import { parseSellerListing, type SellerListingResult } from "@/lib/seller-listing";
import { addSellerListing } from "@/lib/seller-overlay";
import { listingPath, stallPath } from "@/lib/paths";

export async function createSellerListing(
  formData: FormData,
): Promise<SellerListingResult> {
  const parsed = parseSellerListing(formData);
  if (!parsed.ok) {
    return parsed;
  }

  const listing = addSellerListing(parsed.listing);
  const stall = stallById(listing.stallId);

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/hubs");
  revalidatePath(`/hubs/${listing.hubId}`);
  revalidatePath(listingPath(listing.id));
  if (stall) {
    revalidatePath(stallPath(stall.slug));
  }

  return { ok: true, listing };
}
