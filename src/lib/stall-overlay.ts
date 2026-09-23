/**
 * Local stall card stand-in. No database.
 *
 * Patches booth name and blurb on a stall the mall already has.
 * Server: in-memory overlay (same Node process as the shop).
 * Browser: localStorage key `iss:seller-stalls`.
 * Same locked Stall shape as `@/lib/commerce` — id, slug, and featured stay fixture.
 */
import type { Stall } from "./commerce/types";

export const SELLER_STALLS_KEY = "iss:seller-stalls";
export const SELLER_STALLS_CHANGED = "iss:seller-stalls-changed";

export type StallCardPatch = {
  stallId: string;
  boothName: string;
  blurb: string;
};

let memory: StallCardPatch[] = [];

function canUseStorage() {
  return typeof window !== "undefined";
}

function isStallCardPatch(value: unknown): value is StallCardPatch {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Record<string, unknown>;
  return (
    typeof row.stallId === "string" &&
    row.stallId.length > 0 &&
    typeof row.boothName === "string" &&
    row.boothName.length > 0 &&
    typeof row.blurb === "string" &&
    row.blurb.length > 0
  );
}

export function parseStallCards(raw: string | null): StallCardPatch[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isStallCardPatch);
  } catch {
    return [];
  }
}

function readLocalCards(): StallCardPatch[] {
  if (!canUseStorage()) {
    return [];
  }
  return parseStallCards(window.localStorage.getItem(SELLER_STALLS_KEY));
}

export function readStallCards(): StallCardPatch[] {
  if (canUseStorage()) {
    return readLocalCards();
  }
  return memory;
}

export function replaceStallCards(next: StallCardPatch[]) {
  if (canUseStorage()) {
    window.localStorage.setItem(SELLER_STALLS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(SELLER_STALLS_CHANGED));
    return;
  }
  memory = next;
}

export function upsertStallCard(patch: StallCardPatch) {
  const current = readStallCards();
  const next = [patch, ...current.filter((item) => item.stallId !== patch.stallId)];
  replaceStallCards(next);
  return patch;
}

export function stallCardById(stallId: string): StallCardPatch | undefined {
  return readStallCards().find((card) => card.stallId === stallId);
}

/** Overlay name and pitch. Never invents a stall or flips featured. */
export function applyStallCard(stall: Stall): Stall {
  const patch = stallCardById(stall.id);
  if (!patch) {
    return stall;
  }

  return {
    ...stall,
    boothName: patch.boothName,
    blurb: patch.blurb,
  };
}
