/**
 * Paid-walked tape for `/sell/payouts`.
 * Same slips `/orders` already remembers. Same 10% as checkout.
 * Desk stickers without a tote are not cash.
 */
import { mockConnectedAccountId } from "@/lib/checkout";
import {
  addMoney,
  listingById,
  money,
  stallById,
  type Listing,
  type Stall,
} from "@/lib/commerce";
import type { OrderSlip } from "@/lib/order-history";
import { splitOnTag, type PayoutSplit } from "@/lib/seller-payouts";

export type WalkedLine = PayoutSplit & {
  listingId: string;
  listing: Listing | null;
  stall: Stall | null;
  slipId: string;
  paidAt: number;
};

export type WalkedBooth = PayoutSplit & {
  stallId: string;
  slug: string | null;
  boothName: string;
  mockDestination: string;
  lines: WalkedLine[];
};

function uniqueListingIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    out.push(id);
  }
  return out;
}

/** Pay-time tote total when the slip is one line; otherwise the live tag. */
function tagForLine(
  listing: Listing | null,
  slip: OrderSlip,
  uniqueCount: number,
) {
  if (uniqueCount === 1 && Number.isInteger(slip.subtotalCents)) {
    return money(slip.subtotalCents, slip.currency);
  }
  if (listing) {
    return listing.price;
  }
  return null;
}

export function mergeWalkedSlips(
  stored: OrderSlip[],
  seed: OrderSlip | null,
): OrderSlip[] {
  if (!seed) {
    return stored;
  }
  if (stored.some((slip) => slip.id === seed.id)) {
    return stored;
  }
  return [seed, ...stored];
}

export function walkedLinesFromSlips(slips: OrderSlip[]): WalkedLine[] {
  const lines: WalkedLine[] = [];

  for (const slip of slips) {
    const ids = uniqueListingIds(slip.listingIds);
    for (const listingId of ids) {
      const listing = listingById(listingId) ?? null;
      const stall = listing ? (stallById(listing.stallId) ?? null) : null;
      const tag = tagForLine(listing, slip, ids.length);
      if (!tag) {
        continue;
      }
      lines.push({
        listingId,
        listing,
        stall,
        slipId: slip.id,
        paidAt: slip.paidAt,
        ...splitOnTag(tag),
      });
    }
  }

  return lines;
}

export function groupWalkedByStall(lines: WalkedLine[]): WalkedBooth[] {
  const groups = new Map<string, WalkedBooth>();

  for (const line of lines) {
    const stallId = line.stall?.id ?? "unknown";
    const existing = groups.get(stallId);
    if (existing) {
      existing.lines.push(line);
      existing.tag = addMoney(existing.tag, line.tag);
      existing.mallCut = addMoney(existing.mallCut, line.mallCut);
      existing.stallOwed = addMoney(existing.stallOwed, line.stallOwed);
      continue;
    }
    groups.set(stallId, {
      stallId,
      slug: line.stall?.slug ?? null,
      boothName: line.stall?.boothName ?? "Gone from the table",
      mockDestination: line.stall
        ? mockConnectedAccountId(line.stall.id)
        : "acct_test_unknown",
      lines: [line],
      tag: line.tag,
      mallCut: line.mallCut,
      stallOwed: line.stallOwed,
    });
  }

  return [...groups.values()];
}

export function walkedMallTotals(booths: WalkedBooth[]): PayoutSplit & {
  listingCount: number;
} {
  const tag = booths.reduce((sum, row) => addMoney(sum, row.tag), money(0));
  const mallCut = booths.reduce(
    (sum, row) => addMoney(sum, row.mallCut),
    money(0),
  );
  const stallOwed = booths.reduce(
    (sum, row) => addMoney(sum, row.stallOwed),
    money(0),
  );
  const listingCount = booths.reduce((sum, row) => sum + row.lines.length, 0);
  return { tag, mallCut, stallOwed, listingCount };
}
