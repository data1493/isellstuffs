/**
 * Paid stash — don’t-bag paper for one booth.
 * Tape is still-here titles. Queue is who is coming. Taken is they left.
 * Paid lamps still sit on the table until taken. This sheet is the paper
 * so the next walker does not bag twice.
 *
 * Reads paid physical lines from the same sources pickup / queue already
 * read (`iss:orders` + checkout cookie). Drops taken pairs. Here still
 * counts until taken. Does not write sold, taken, here, tote, or tape.
 */
import { formatMoney, stallBySlug, type Stall } from "@/lib/commerce";
import { listingFact, listingFactLabel } from "@/lib/listing-display";
import type { OrderSlip } from "@/lib/order-history";
import { physicalLinesOnSlip } from "@/lib/pickup-slip";
import {
  isHandoffTaken,
  type TakenHandoff,
} from "@/lib/taken-handoff";

export const STASH_MISSING_COPY = "That stall packed up.";
export const STASH_EMPTY_COPY = "Nothing in the stash.";
export const STASH_EMPTY_BODY =
  "Still-here stays on the table tape.";
export const STASH_HAND_LINE =
  "Paid. In the stash. Don’t bag. Not the table tape.";
export const STASH_REFUSE = "We do not ship.";

export type PaidStashKind = "sheet" | "empty" | "missing";

export type PaidStashSlip = Pick<OrderSlip, "id" | "listingIds">;

export type PaidStashRow = {
  listingId: string;
  title: string;
  tagLabel: string;
  fact: string;
  factLabel: string;
  slipId: string;
};

export type PaidStashSheet = {
  kind: PaidStashKind;
  slug: string;
  stall: Stall | null;
  rows: PaidStashRow[];
  refuse: string;
};

/** Checkout slips mix lamps and PDFs. Stash paper is this booth’s physicals. */
export function clipPaidStashSeed(
  seed: PaidStashSlip | null,
  slug: string,
): PaidStashSlip | null {
  const stall = stallBySlug(slug);
  if (!seed || !stall) {
    return null;
  }

  const listingIds = physicalLinesOnSlip(seed.listingIds)
    .filter((line) => line.stall.id === stall.id)
    .map((line) => line.listing.id);

  if (listingIds.length === 0) {
    return null;
  }

  return { id: seed.id, listingIds };
}

export function mergePaidStashSlips(
  stored: readonly PaidStashSlip[],
  seed: PaidStashSlip | null,
): PaidStashSlip[] {
  if (!seed) {
    return [...stored];
  }
  if (stored.some((slip) => slip.id === seed.id)) {
    return [...stored];
  }
  return [seed, ...stored];
}

export function paidStashRowsForStall(
  stall: Stall,
  slips: readonly PaidStashSlip[],
  taken: TakenHandoff[] = [],
): PaidStashRow[] {
  const rows: PaidStashRow[] = [];
  const seen = new Set<string>();

  for (const slip of slips) {
    for (const line of physicalLinesOnSlip(slip.listingIds)) {
      if (line.stall.id !== stall.id) {
        continue;
      }

      const key = `${slip.id}:${line.listing.id}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      if (isHandoffTaken(slip.id, line.listing.id, taken)) {
        continue;
      }

      rows.push({
        listingId: line.listing.id,
        title: line.listing.title,
        tagLabel: formatMoney(line.listing.price),
        fact: listingFact(line.listing),
        factLabel: listingFactLabel(line.listing),
        slipId: slip.id,
      });
    }
  }

  return rows;
}

export function paidStashForSlug(
  slug: string,
  slips: readonly PaidStashSlip[] = [],
  taken: TakenHandoff[] = [],
): PaidStashSheet {
  const stall = stallBySlug(slug);

  if (!stall) {
    return {
      kind: "missing",
      slug,
      stall: null,
      rows: [],
      refuse: STASH_MISSING_COPY,
    };
  }

  const rows = paidStashRowsForStall(stall, slips, taken);

  if (rows.length === 0) {
    return {
      kind: "empty",
      slug,
      stall,
      rows: [],
      refuse: STASH_EMPTY_COPY,
    };
  }

  return {
    kind: "sheet",
    slug,
    stall,
    rows,
    refuse: STASH_REFUSE,
  };
}
