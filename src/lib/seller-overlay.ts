/**
 * Local seller stand-in. No database.
 *
 * Server: process-wide store plus `.data/seller-listings.json`.
 * Browser: localStorage key `iss:seller-listings`.
 * Same locked Listing shape as `@/lib/commerce`.
 */
import type { Listing } from "./commerce/types";

export const SELLER_LISTINGS_KEY = "iss:seller-listings";
export const SELLER_LISTINGS_CHANGED = "iss:seller-listings-changed";

const SERVER_STORE = Symbol.for("iss.seller-listings");
const DATA_FILE = ".data/seller-listings.json";

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: Listing[];
};

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

function readFileListings(): Listing[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { readFileSync } = require("fs") as typeof import("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { join } = require("path") as typeof import("path");
    return parseSellerListings(readFileSync(join(process.cwd(), DATA_FILE), "utf8"));
  } catch {
    return [];
  }
}

function writeFileListings(next: Listing[]) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { mkdirSync, writeFileSync } = require("fs") as typeof import("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { dirname, join } = require("path") as typeof import("path");
    const file = join(process.cwd(), DATA_FILE);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(next));
  } catch {
    // local stand-in — ignore a blocked write
  }
}

function serverStore(): Listing[] {
  const g = globalThis as ServerGlobal;
  if (!g[SERVER_STORE]) {
    g[SERVER_STORE] = readFileListings();
  }
  return g[SERVER_STORE];
}

export function readSellerListings(): Listing[] {
  if (canUseStorage()) {
    return readLocalListings();
  }
  return serverStore();
}

export function replaceSellerListings(next: Listing[]) {
  if (canUseStorage()) {
    window.localStorage.setItem(SELLER_LISTINGS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(SELLER_LISTINGS_CHANGED));
    return;
  }
  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  writeFileListings(next);
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

/** Replace one overlay row by id. Fixtures are not in this store. */
export function replaceSellerListing(listing: Listing): Listing | undefined {
  const current = readSellerListings();
  const index = current.findIndex((item) => item.id === listing.id);
  if (index === -1) {
    return undefined;
  }
  const next = current.slice();
  next[index] = listing;
  replaceSellerListings(next);
  return listing;
}

export function sellerListingById(id: string): Listing | undefined {
  return readSellerListings().find((listing) => listing.id === id);
}
