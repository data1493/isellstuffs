/**
 * Next-weekend ad inventory and local mock bookings.
 * Sold this-window fixtures stay in `@/lib/commerce` catalog slots.
 * Do not write booked corners onto home or explore from here.
 */
import {
  adSlotKinds,
  formatMoney,
  mallHubs,
  money,
  type AdSlotKind,
  type HubId,
  type Money,
} from "@/lib/commerce";

export const AD_BOOKINGS_STORAGE_KEY = "iss:ad-bookings";
export const AD_BOOKINGS_COOKIE = "iss-ad-bookings";
export const AD_BOOKINGS_CHANGED_EVENT = "iss:ad-bookings-changed";

export const NEXT_WINDOW = "Next weekend" as const;

/**
 * Next-window package. Same AdSlot fields a rate-card SKU needs.
 * No stallId — the booth name is collected on the book form.
 */
export type NextWindowPackage = {
  id: string;
  kind: AdSlotKind;
  labeled: true;
  packageName: string;
  headline: string;
  blurb: string;
  price: Money;
  window: typeof NEXT_WINDOW;
};

export type AdBooking = {
  id: string;
  kind: AdSlotKind;
  stallName: string;
  hubId?: HubId;
  packageName: string;
  price: Money;
  window: typeof NEXT_WINDOW;
  labeled: true;
};

export const nextWindowPackages: readonly NextWindowPackage[] = [
  {
    id: "next-featured-stall",
    kind: "featured-stall",
    labeled: true,
    packageName: "Featured stall, next weekend",
    headline: "Featured stall, next weekend",
    blurb:
      "The good corner on home and on unfiltered explore. The stall page wears the same paid stamp.",
    price: money(2500),
    window: NEXT_WINDOW,
  },
  {
    id: "next-homepage-takeover",
    kind: "homepage-takeover",
    labeled: true,
    packageName: "Homepage takeover, next Fri–Mon",
    headline: "Homepage takeover, next Fri–Mon",
    blurb:
      "The concourse hero until Monday. You do not replace the mall pitch. You do not look organic.",
    price: money(4500),
    window: NEXT_WINDOW,
  },
  {
    id: "next-hub-takeover",
    kind: "hub-takeover",
    labeled: true,
    packageName: "Hub takeover, next weekend",
    headline: "Hub takeover, next weekend",
    blurb:
      "One aisle hero. Pick a locked hub. Money buys light, not a rewrite of the rule.",
    price: money(1800),
    window: NEXT_WINDOW,
  },
];

export function isAdSlotKind(value: string): value is AdSlotKind {
  return (adSlotKinds as readonly string[]).includes(value);
}

export function isHubId(value: string): value is HubId {
  return mallHubs.some((hub) => hub.id === value);
}

export function nextWindowPackageByKind(
  kind: string,
): NextWindowPackage | undefined {
  if (!isAdSlotKind(kind)) {
    return undefined;
  }
  return nextWindowPackages.find((pack) => pack.kind === kind);
}

export function bookingPriceLabel(price: Money) {
  return formatMoney(price);
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function isMoney(value: unknown): value is Money {
  if (!value || typeof value !== "object") {
    return false;
  }
  const moneyValue = value as Money;
  return (
    Number.isInteger(moneyValue.amountCents) && moneyValue.currency === "usd"
  );
}

function isAdBooking(value: unknown): value is AdBooking {
  if (!value || typeof value !== "object") {
    return false;
  }
  const booking = value as AdBooking;
  if (
    typeof booking.id !== "string" ||
    !isAdSlotKind(booking.kind) ||
    typeof booking.stallName !== "string" ||
    typeof booking.packageName !== "string" ||
    booking.window !== NEXT_WINDOW ||
    booking.labeled !== true ||
    !isMoney(booking.price)
  ) {
    return false;
  }
  if (booking.hubId !== undefined && !isHubId(booking.hubId)) {
    return false;
  }
  return true;
}

export function parseAdBookings(raw: string | null | undefined): AdBooking[] {
  if (!raw) {
    return [];
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
      return [];
    }
    return parsed.filter(isAdBooking);
  } catch {
    return [];
  }
}

export function readAdBookings(): AdBooking[] {
  if (!canUseStorage()) {
    return [];
  }
  try {
    return parseAdBookings(window.localStorage.getItem(AD_BOOKINGS_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function readAdBooking(id: string): AdBooking | undefined {
  if (!id) {
    return undefined;
  }
  return readAdBookings().find((booking) => booking.id === id);
}

export function subscribeAdBookings(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === AD_BOOKINGS_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(AD_BOOKINGS_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(AD_BOOKINGS_CHANGED_EVENT, listener);
  };
}

function persistBookings(next: AdBooking[]) {
  const raw = JSON.stringify(next);
  try {
    window.localStorage.setItem(AD_BOOKINGS_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${AD_BOOKINGS_COOKIE}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(AD_BOOKINGS_CHANGED_EVENT));
}

export function mergeAdBooking(
  existing: AdBooking[],
  booking: AdBooking,
): AdBooking[] {
  return [booking, ...existing.filter((item) => item.id !== booking.id)];
}

export function serializeAdBookings(bookings: AdBooking[]) {
  return JSON.stringify(bookings);
}

export function writeAdBooking(booking: AdBooking) {
  if (!canUseStorage()) {
    return;
  }
  persistBookings(mergeAdBooking(readAdBookings(), booking));
}

export function createAdBooking(input: {
  kind: AdSlotKind;
  stallName: string;
  hubId?: HubId;
}): AdBooking {
  const pack = nextWindowPackageByKind(input.kind);
  if (!pack) {
    throw new Error(`Unknown next-window package: ${input.kind}`);
  }

  const stallName = input.stallName.trim().replace(/\s+/g, " ");
  if (stallName.length < 2) {
    throw new Error("Name the stall.");
  }

  if (pack.kind === "hub-takeover") {
    if (!input.hubId || !isHubId(input.hubId)) {
      throw new Error("Pick a hub.");
    }
  }

  const stamp = Date.now().toString(36);
  const nonce = Math.random().toString(36).slice(2, 6);

  return {
    id: `book-${pack.kind}-${stamp}${nonce}`,
    kind: pack.kind,
    stallName,
    ...(pack.kind === "hub-takeover" && input.hubId
      ? { hubId: input.hubId }
      : {}),
    packageName: pack.packageName,
    price: pack.price,
    window: NEXT_WINDOW,
    labeled: true,
  };
}
