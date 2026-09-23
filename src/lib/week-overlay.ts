/**
 * Local weekend-table overlay. No database.
 *
 * Fixture ids in `@/lib/week-pick` stay the default when nothing is taped.
 * A saved overlay replaces the default for this browser.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:week-picks` is the client table.
 * Cookie `iss-week-picks` is the same JSON so `/this-week` can SSR it.
 *
 * Sold and file-gone never make the drop.
 */
import { allListings, listingById, type Listing } from "@/lib/commerce";
import { thisWeekPickIds } from "@/lib/week-pick";

export const WEEK_PICKS_STORAGE_KEY = "iss:week-picks";
export const WEEK_PICKS_COOKIE_NAME = "iss-week-picks";
export const WEEK_PICKS_CHANGED_EVENT = "iss:week-picks-changed";

export type WeekPickWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: "none-eligible"; listingIds: string[] };

const fixtureIds: string[] = [...thisWeekPickIds];

function canUseStorage() {
  return typeof window !== "undefined";
}

export function isEligibleWeekPick(listing: Listing) {
  return listing.status !== "sold" && listing.status !== "file-gone";
}

export function parseWeekPickOverlay(
  raw: string | null | undefined,
): string[] | null {
  if (raw == null || raw === "") {
    return null;
  }

  try {
    let value = raw;
    try {
      value = decodeURIComponent(raw);
    } catch {
      value = raw;
    }
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return null;
  }
}

export function sanitizeWeekPickIds(ids: readonly string[]) {
  const seen = new Set<string>();
  const clean: string[] = [];

  for (const id of ids) {
    if (seen.has(id)) {
      continue;
    }
    const listing = listingById(id);
    if (!listing || !isEligibleWeekPick(listing)) {
      continue;
    }
    seen.add(id);
    clean.push(id);
  }

  return clean;
}

export function resolveWeekPickIds(raw: string | null | undefined): {
  ids: string[];
  fromOverlay: boolean;
} {
  const overlay = parseWeekPickOverlay(raw);
  if (overlay === null) {
    return { ids: fixtureIds, fromOverlay: false };
  }

  return { ids: sanitizeWeekPickIds(overlay), fromOverlay: true };
}

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${WEEK_PICKS_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

export function readWeekPickRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const fromStorage = window.localStorage.getItem(WEEK_PICKS_STORAGE_KEY);
    if (fromStorage != null && fromStorage !== "") {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }

  return readCookieRaw();
}

export function readResolvedWeekPickIds() {
  return resolveWeekPickIds(readWeekPickRaw());
}

export function writeWeekPickIds(listingIds: readonly string[]): WeekPickWriteResult {
  const clean = sanitizeWeekPickIds(listingIds);
  if (!canUseStorage()) {
    return { ok: true, listingIds: clean };
  }

  const raw = JSON.stringify(clean);
  try {
    window.localStorage.setItem(WEEK_PICKS_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${WEEK_PICKS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(WEEK_PICKS_CHANGED_EVENT));
  return { ok: true, listingIds: clean };
}

export function clearWeekPickOverlay() {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(WEEK_PICKS_STORAGE_KEY);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${WEEK_PICKS_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(WEEK_PICKS_CHANGED_EVENT));
}

export function eligibleWeekListings() {
  return allListings().filter(isEligibleWeekPick);
}

export function rejectedWeekListings() {
  return allListings().filter((listing) => !isEligibleWeekPick(listing));
}

export function defaultWeekPickIds() {
  return fixtureIds;
}
