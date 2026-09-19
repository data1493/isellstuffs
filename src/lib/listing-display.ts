import {
  hubById,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export function listingTypeLabel(listing: Listing) {
  return listing.type === "physical" ? "Physical" : "Digital";
}

export function listingFactLabel(listing: Listing) {
  return isPhysicalListing(listing) ? "Condition" : "File format";
}

export function listingFact(listing: Listing) {
  return isPhysicalListing(listing) ? listing.condition : listing.fileFormat;
}

export function listingStatusLabel(listing: Listing) {
  if (listing.status === "sold") {
    return "Sold";
  }
  if (listing.status === "file-gone") {
    return "File gone";
  }
  return isPhysicalListing(listing) ? "On the table" : "File ready";
}

export function listingHub(listing: Listing) {
  return hubById(listing.hubId);
}

export function listingHubName(listing: Listing) {
  return listingHub(listing).name;
}

export function addToCartLabel(listing: Listing) {
  return isPhysicalListing(listing) ? "Add to cart" : "Add the file";
}

export function inCartLabel(listing: Listing) {
  return isPhysicalListing(listing)
    ? "In your cart"
    : "File is in the cart";
}

export function unavailableCartLabel(listing: Listing) {
  if (listing.status === "sold") {
    return "Sold — someone else got it";
  }
  if (listing.status === "file-gone") {
    return "File's gone";
  }
  return "Not for the cart";
}

export function fulfillmentCopy(listing: Listing) {
  if (listing.status === "sold") {
    return "Gone from the table. The stall may still have a file or another object.";
  }
  if (listing.status === "file-gone") {
    return "The folder is empty. The stall may still have something you can hold.";
  }
  if (isPhysicalListing(listing)) {
    return "One of these on the table. Condition is the listing. Pickup and shipping land with checkout.";
  }
  return "A file from this stall, not a second shop. You get the download after checkout.";
}

export function addedCopy(listing: Listing, count: number) {
  const bag = count === 1 ? "1 listing in the bag" : `${count} listings in the bag`;
  if (isPhysicalListing(listing)) {
    return `Added. ${bag}. Checkout is a later aisle.`;
  }
  return `File added. ${bag}. Same stall as the junk.`;
}

export function alreadyInCartCopy(listing: Listing) {
  return isPhysicalListing(listing)
    ? "Already on your list. One of each SKU."
    : "That file is already in the bag. One of each SKU.";
}

export function listingKindEyebrow(listing: Listing) {
  return isPhysicalListing(listing)
    ? "Thing you can hold"
    : "File from the same stall";
}

export function listingMediaKicker(listing: Listing) {
  return isPhysicalListing(listing) ? "No photo yet" : "No preview yet";
}
