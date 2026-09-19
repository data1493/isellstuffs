/**
 * Still-here price sheet for one booth. Bag this table scoops the tote;
 * this is the paper taped to the table. Reads live `listingsByStall`
 * (seller overlay + sold / file-gone stamps). Does not write overlays,
 * the tote, or pickup hours.
 */
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingsByStall,
  stallBySlug,
  type Listing,
  type Stall,
} from "@/lib/commerce";
import { listingFact, listingFactLabel } from "@/lib/listing-display";

export const TAPE_MISSING_COPY = "No tape for that stall.";
export const TAPE_EMPTY_COPY = "Nothing still here to tape.";
export const TAPE_REFUSE = "We do not ship.";
export const TAPE_HAND_LINE = "Sold stickers stay off this sheet.";
export const TAPE_SCOOP_LINE =
  "Bag this table scoops the tote. This sheet is the paper.";

export type TableTapeKind = "sheet" | "empty" | "missing";
export type TableTapeRowKind = "physical" | "digital" | "gift";

export type TableTapeRow = {
  listingId: string;
  title: string;
  priceLabel: string;
  fact: string;
  factLabel: string;
  kind: TableTapeRowKind;
};

export type TableTapeSheet = {
  kind: TableTapeKind;
  slug: string;
  stall: Stall | null;
  rows: TableTapeRow[];
  refuse: string;
};

export function stillHereOnStall(listings: readonly Listing[]): Listing[] {
  return listings.filter((listing) => listing.status === "available");
}

export function tableTapeRowKind(listing: Listing): TableTapeRowKind {
  if (isPhysicalListing(listing)) {
    return "physical";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  return "digital";
}

export function toTableTapeRow(listing: Listing): TableTapeRow {
  return {
    listingId: listing.id,
    title: listing.title,
    priceLabel: formatMoney(listing.price),
    fact: listingFact(listing),
    factLabel: listingFactLabel(listing),
    kind: tableTapeRowKind(listing),
  };
}

export function tableTapeForSlug(slug: string): TableTapeSheet {
  const stall = stallBySlug(slug);

  if (!stall) {
    return {
      kind: "missing",
      slug,
      stall: null,
      rows: [],
      refuse: TAPE_MISSING_COPY,
    };
  }

  const rows = stillHereOnStall(listingsByStall(stall.id)).map(toTableTapeRow);

  if (rows.length === 0) {
    return {
      kind: "empty",
      slug,
      stall,
      rows: [],
      refuse: TAPE_EMPTY_COPY,
    };
  }

  return {
    kind: "sheet",
    slug,
    stall,
    rows,
    refuse: TAPE_REFUSE,
  };
}
