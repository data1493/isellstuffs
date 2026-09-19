/**
 * Paper payouts for `/sell/payouts`.
 * Same 10% cut checkout already uses. No Connect, no bank, no database.
 */
import {
  PLATFORM_FEE_BPS,
  mockConnectedAccountId,
  platformFeeOn,
} from "@/lib/checkout";
import {
  addMoney,
  allStalls,
  isCartEligible,
  listingById,
  listingsByStall,
  money,
  type Listing,
  type Money,
  type Stall,
} from "@/lib/commerce";

/** Fixture SKUs that make the cut obvious — lamp, Game Boy, a $2 PDF. */
const EXAMPLE_LISTING_IDS = [
  "ysk-wobbly-lamp",
  "gtk-game-boy",
  "dl-junk-pricing-pdf",
] as const;

export type PayoutSplit = {
  tag: Money;
  mallCut: Money;
  stallOwed: Money;
};

export type ListingPayoutExample = PayoutSplit & {
  listing: Listing;
  stall: Stall;
};

export type StallPayoutRow = PayoutSplit & {
  stall: Stall;
  listingCount: number;
  mockDestination: string;
};

export const feePercent = PLATFORM_FEE_BPS / 100;

export function splitOnTag(tag: Money): PayoutSplit {
  const mallCut = platformFeeOn(tag);
  return {
    tag,
    mallCut,
    stallOwed: money(tag.amountCents - mallCut.amountCents, tag.currency),
  };
}

/** $10 contract example — same basis as `/fees`. */
export function contractExample(): PayoutSplit {
  return splitOnTag(money(1000));
}

export function listingPayoutExamples(): ListingPayoutExample[] {
  const rows: ListingPayoutExample[] = [];

  for (const id of EXAMPLE_LISTING_IDS) {
    const listing = listingById(id);
    if (!listing || !isCartEligible(listing)) {
      continue;
    }
    const stall = allStalls().find((item) => item.id === listing.stallId);
    if (!stall) {
      continue;
    }
    rows.push({
      listing,
      stall,
      ...splitOnTag(listing.price),
    });
  }

  return rows;
}

/**
 * If every cart-eligible listing on the stall sold tonight.
 * Sold and file-gone stay off the paper.
 */
export function stallPayoutRows(): StallPayoutRow[] {
  return allStalls().map((stall) => {
    const eligible = listingsByStall(stall.id).filter(isCartEligible);
    const tag = eligible.reduce(
      (sum, listing) => addMoney(sum, listing.price),
      money(0),
    );
    const split = splitOnTag(tag);
    return {
      stall,
      listingCount: eligible.length,
      mockDestination: mockConnectedAccountId(stall.id),
      ...split,
    };
  });
}

export function mallPayoutTotals(rows: StallPayoutRow[]): PayoutSplit & {
  listingCount: number;
} {
  const tag = rows.reduce((sum, row) => addMoney(sum, row.tag), money(0));
  const mallCut = rows.reduce(
    (sum, row) => addMoney(sum, row.mallCut),
    money(0),
  );
  const stallOwed = rows.reduce(
    (sum, row) => addMoney(sum, row.stallOwed),
    money(0),
  );
  const listingCount = rows.reduce((sum, row) => sum + row.listingCount, 0);
  return { tag, mallCut, stallOwed, listingCount };
}
