/**
 * Paper 3×5 for a physical listing. Digital files are not driveway tags.
 * Reads live `listingById` (seller overlay + sold stamp). Does not write
 * sold-overlay storage or pickup hours.
 */
import {
  formatMoney,
  isDigitalListing,
  isPhysicalListing,
  listingById,
  stallById,
  type Listing,
} from "@/lib/commerce";
import { listingHubName, listingStatusLabel } from "@/lib/listing-display";

export const TAG_MISSING_COPY = "No tag for that listing.";
export const PHYSICAL_REFUSE = "We do not ship.";
export const PHYSICAL_HAND_LINE = "Pay the mall, then the table.";
export const DIGITAL_FOLDER_LINE = "Opens in the folder after pay.";
export const DIGITAL_FILE_LINE = "File goes in the folder.";
export const GIFT_DESK_LINE = "Code goes to the gift desk.";

export type PriceTagKind = "physical" | "digital" | "gift" | "missing";

export type PriceTagSheet = {
  kind: PriceTagKind;
  listingId: string;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  hubName: string | null;
  statusWord: string | null;
  refuse: string;
  listing: Listing | null;
};

export function priceTagForId(id: string): PriceTagSheet {
  const listing = listingById(id);

  if (!listing) {
    return {
      kind: "missing",
      listingId: id,
      title: null,
      priceLabel: null,
      fact: null,
      stallName: null,
      hubName: null,
      statusWord: null,
      refuse: TAG_MISSING_COPY,
      listing: null,
    };
  }

  const stall = stallById(listing.stallId);
  const stallName = stall?.boothName ?? listing.stallId;
  const hubName = listingHubName(listing);
  const worn =
    listing.status === "sold" || listing.status === "file-gone"
      ? listingStatusLabel(listing)
      : null;

  if (isPhysicalListing(listing)) {
    return {
      kind: "physical",
      listingId: listing.id,
      title: listing.title,
      priceLabel: formatMoney(listing.price),
      fact: listing.condition,
      stallName,
      hubName,
      statusWord: worn,
      refuse: PHYSICAL_REFUSE,
      listing,
    };
  }

  if (isDigitalListing(listing)) {
    const gift = listing.fileFormat.toUpperCase().includes("GIFT");
    return {
      kind: gift ? "gift" : "digital",
      listingId: listing.id,
      title: listing.title,
      priceLabel: formatMoney(listing.price),
      fact: listing.fileFormat,
      stallName,
      hubName,
      statusWord: worn,
      refuse: gift ? GIFT_DESK_LINE : DIGITAL_FOLDER_LINE,
      listing,
    };
  }

  return {
    kind: "missing",
    listingId: id,
    title: null,
    priceLabel: null,
    fact: null,
    stallName: null,
    hubName: null,
    statusWord: null,
    refuse: TAG_MISSING_COPY,
    listing: null,
  };
}
