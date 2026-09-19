/**
 * Local seller stand-in. No database.
 *
 * Server: in-memory overlay (same Node process as the shop).
 * Browser: localStorage key `iss:seller-listings`.
 * Same locked Listing shape as `@/lib/commerce`.
 */
import type { Listing } from "./commerce/types";

export const SELLER_LISTINGS_KEY = "iss:seller-listings";
export const SELLER_LISTINGS_CHANGED = "iss:seller-listings-changed";

let memory: Listing[] = [];

function canUseStorage() {
  return typeof window !== "undefined";
}

function isListingRecord(value: unknown): value is Listing {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Record<string, unknown>;
  const price = row.price;
  if (!price || typeof price !== "object") {
    return false;
  }

  const money = price as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.stallId !== "string" ||
    typeof row.title !== "string" ||
    typeof row.summary !== "string" ||
    typeof row.hubId !== "string" ||
    typeof row.cartEligible !== "boolean" ||
    (row.status !== "available" &&
      row.status !== "sold" &&
      row.status !== "file-gone") ||
    typeof money.amountCents !== "number" ||
    money.currency !== "usd"
  ) {
    return false;
  }

  if (row.type === "physical") {
    return typeof row.condition === "string";
  }

  if (row.type === "digital") {
    return typeof row.fileFormat === "string";
  }

  return false;
}

export function parseSellerListings(raw: string | null): Listing[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isListingRecord);
  } catch {
    return [];
  }
}

function readLocalListings(): Listing[] {
  if (!canUseStorage()) {
    return [];
  }
  return parseSellerListings(window.localStorage.getItem(SELLER_LISTINGS_KEY));
}

export function readSellerListings(): Listing[] {
  if (canUseStorage()) {
    return readLocalListings();
  }
  return memory;
}

export function replaceSellerListings(next: Listing[]) {
  if (canUseStorage()) {
    window.localStorage.setItem(SELLER_LISTINGS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(SELLER_LISTINGS_CHANGED));
    return;
  }
  memory = next;
}

export function addSellerListing(listing: Listing) {
  const current = readSellerListings();
  const next = [
    listing,
    ...current.filter((item) => item.id !== listing.id),
  ];
  replaceSellerListings(next);
  return listing;
}

export function sellerListingById(id: string): Listing | undefined {
  return readSellerListings().find((listing) => listing.id === id);
}
