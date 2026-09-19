import {
  hubById,
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";
import { isStallPacked } from "@/lib/packed-stall";

export function listingTypeLabel(listing: Listing) {
  if (isPhysicalListing(listing)) {
    return "Physical";
  }
  if (isGiftListing(listing)) {
    return "Gift card";
  }
  return "Digital";
}

export function listingFactLabel(listing: Listing) {
  if (isPhysicalListing(listing)) {
    return "Condition";
  }
  if (isGiftListing(listing)) {
    return "What you get";
  }
  return "File format";
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
  if (isPhysicalListing(listing)) {
    return "On the table";
  }
  if (isGiftListing(listing)) {
    return "On the desk";
  }
  return "File ready";
}

export function listingHub(listing: Listing) {
  return hubById(listing.hubId);
}

export function listingHubName(listing: Listing) {
  return listingHub(listing).name;
}

export function addToCartLabel(listing: Listing) {
  if (isPhysicalListing(listing)) {
    return "Add to cart";
  }
  if (isGiftListing(listing)) {
    return "Add the gift card";
  }
  return "Add the file";
}

export function inCartLabel(listing: Listing) {
  if (isPhysicalListing(listing)) {
    return "In your cart";
  }
  if (isGiftListing(listing)) {
    return "Gift card is in the tote";
  }
  return "File is in the cart";
}

export function unavailableCartLabel(listing: Listing) {
  if (listing.status === "sold") {
    return "Sold — someone else got it";
  }
  if (listing.status === "file-gone") {
    return "File's gone";
  }
  if (isPhysicalListing(listing) && isStallPacked(listing.stallId)) {
    return "Packed up — next weekend";
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
  if (isPhysicalListing(listing) && isStallPacked(listing.stallId)) {
    return "This booth packed up. The table went in the car. Not a refund. Not a sold sticker. Come next weekend.";
  }
  if (isPhysicalListing(listing)) {
    return "One of these on the table. Condition is the listing. Pickup and shipping land with checkout.";
  }
  if (isGiftListing(listing)) {
    return "Mall credit from the gift desk. Not a PDF. After checkout you get a stand-in code — no Stripe gift, no reload API.";
  }
  return "A file from this stall, not a second shop. You get the download after checkout.";
}

export function addedCopy(listing: Listing, count: number) {
  const bag = count === 1 ? "1 listing in the bag" : `${count} listings in the bag`;
  if (isPhysicalListing(listing)) {
    return `Added. ${bag}. Checkout is a later aisle.`;
  }
  if (isGiftListing(listing)) {
    return `Gift card added. ${bag}. Same tote as the junk.`;
  }
  return `File added. ${bag}. Same stall as the junk.`;
}

export function alreadyInCartCopy(listing: Listing) {
  if (isPhysicalListing(listing)) {
    return "Already on your list. One of each SKU.";
  }
  if (isGiftListing(listing)) {
    return "That card is already in the tote. One of each SKU.";
  }
  return "That file is already in the bag. One of each SKU.";
}

export function listingKindEyebrow(listing: Listing) {
  if (isPhysicalListing(listing)) {
    return "Thing you can hold";
  }
  if (isGiftListing(listing)) {
    return "Mall gift card";
  }
  return "File from the same stall";
}

export function listingMediaKicker(listing: Listing) {
  if (isPhysicalListing(listing)) {
    return "No photo yet";
  }
  if (isGiftListing(listing)) {
    return "No plastic card";
  }
  return "No preview yet";
}

export function listingHeroEyebrow(listing: Listing) {
  if (isPhysicalListing(listing)) {
    return "Object on the table";
  }
  if (isGiftListing(listing)) {
    return "Mall gift card";
  }
  return "Download under the table";
}

export function listingBuyKicker(listing: Listing) {
  if (isPhysicalListing(listing)) {
    return "Take it home";
  }
  if (isGiftListing(listing)) {
    return "Give the mall";
  }
  return "Take the file";
}

export function listingMediaPreviewLine(listing: Listing) {
  if (isPhysicalListing(listing)) {
    return "The condition is the picture.";
  }
  if (isGiftListing(listing)) {
    return "The denomination is the card.";
  }
  return "The format is the preview.";
}

export function listingSiblingKicker(listing: Listing) {
  if (isPhysicalListing(listing)) {
    return "files live here too";
  }
  if (isGiftListing(listing)) {
    return "the desk is just the card";
  }
  return "objects live here too";
}
