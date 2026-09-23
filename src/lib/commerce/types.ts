import type { HubId } from "./hubs";
import type { Money } from "./money";

export const listingTypes = ["physical", "digital"] as const;
export type ListingType = (typeof listingTypes)[number];

export const listingStatuses = ["available", "sold", "file-gone"] as const;
export type ListingStatus = (typeof listingStatuses)[number];

type ListingBase = {
  id: string;
  stallId: string;
  title: string;
  summary: string;
  /** Obsessive aisle this listing sits in. Digital listings use download-stall. */
  hubId: HubId;
  price: Money;
  /** False when sold, file-gone, or otherwise not add-to-cart. */
  cartEligible: boolean;
  status: ListingStatus;
};

/** Physical listing: condition is first-class. “Tested, kinda” is valid copy. */
export type PhysicalListing = ListingBase & {
  type: "physical";
  condition: string;
};

/** Digital listing: file format instead of condition. Same stall as the junk. */
export type DigitalListing = ListingBase & {
  type: "digital";
  fileFormat: string;
};

export type Listing = PhysicalListing | DigitalListing;

export type Stall = {
  id: string;
  slug: string;
  boothName: string;
  /** Paid booth on the mall floor. Pair with a featured-stall ad slot. */
  featured: boolean;
  blurb: string;
};

export const adSlotKinds = [
  "featured-stall",
  "homepage-takeover",
  "hub-takeover",
] as const;
export type AdSlotKind = (typeof adSlotKinds)[number];

/**
 * Campaign-shaped ad fixture. Always labeled — no stealth sponsored rows.
 * Prices here are package copy, not a billing integration.
 */
export type AdSlot = {
  id: string;
  kind: AdSlotKind;
  labeled: true;
  stallId: string;
  headline: string;
  blurb: string;
  packageName: string;
  price: Money;
  window: string;
  hubId?: HubId;
};

export type FeaturedStall = Extract<AdSlot, { kind: "featured-stall" }>;

export function isPhysicalListing(
  listing: Listing,
): listing is PhysicalListing {
  return listing.type === "physical";
}

export function isDigitalListing(listing: Listing): listing is DigitalListing {
  return listing.type === "digital";
}

/**
 * Stand-in mall gift card. Still a digital listing — not a Stripe / payment-provider gift SKU.
 * Detected by fileFormat so the PDP can talk like a desk, not a PDF.
 */
export function isGiftListing(listing: Listing): boolean {
  return isDigitalListing(listing) && listing.fileFormat.toUpperCase().includes("GIFT");
}

export function isCartEligible(listing: Listing): boolean {
  return listing.cartEligible && listing.status === "available";
}

export function isFeaturedStallSlot(slot: AdSlot): slot is FeaturedStall {
  return slot.kind === "featured-stall";
}
