/**
 * Wave 1 commerce contracts.
 *
 * Other agents should import from `@/lib/commerce` — do not invent
 * listing, stall, or ad-slot shapes. Pages are Wave 2+.
 */

export { mallHubs, hubById, type HubId } from "./hubs";
export {
  money,
  formatMoney,
  addMoney,
  isZero,
  type Money,
  type Currency,
} from "./money";
export {
  listingTypes,
  listingStatuses,
  adSlotKinds,
  isPhysicalListing,
  isDigitalListing,
  isCartEligible,
  isFeaturedStallSlot,
  type ListingType,
  type ListingStatus,
  type PhysicalListing,
  type DigitalListing,
  type Listing,
  type Stall,
  type AdSlotKind,
  type AdSlot,
  type FeaturedStall,
} from "./types";
export {
  stalls,
  listings,
  adSlots,
  stallById,
  stallBySlug,
  listingById,
  listingsByStall,
  listingsByHub,
  listingsByType,
  cartEligibleListings,
  featuredStalls,
  adSlotsByKind,
  featuredStallSlots,
} from "./catalog";
