/**
 * Stand-in order slips. No database, no account.
 * Persist the last checkout session and reconstruct tote lines
 * from those listing ids via `@/lib/live-catalog`.
 */
import type { CheckoutSessionSummary } from "@/lib/checkout";
import { parseCheckoutSession } from "@/lib/checkout";
import type { Listing, Stall } from "@/lib/commerce";
import { liveListingById, liveStallById } from "@/lib/live-catalog";

export const ORDERS_STORAGE_KEY = "iss:orders";
export const ORDERS_CHANGED_EVENT = "iss:orders-changed";

const MAX_ORDERS = 20;

export type OrderSlip = CheckoutSessionSummary & {
  paidAt: number;
};

export type OrderLine = {
  listingId: string;
  listing: Listing | null;
  stall: Stall | null;
};

export type OrderStallGroup = {
  stallId: string;
  boothName: string;
  lines: OrderLine[];
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isTransfer(
  value: unknown,
): value is OrderSlip["transfers"][number] {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as OrderSlip["transfers"][number];
  return (
    typeof row.stallId === "string" &&
    typeof row.boothName === "string" &&
    typeof row.destination === "string" &&
    Number.isInteger(row.amountCents)
  );
}

export function isOrderSlip(value: unknown): value is OrderSlip {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as Partial<OrderSlip>;
  if (
    typeof row.id !== "string" ||
    (row.mode !== "stripe-test" && row.mode !== "local-mock") ||
    !Array.isArray(row.listingIds) ||
    !row.listingIds.every((id) => typeof id === "string") ||
    !Number.isInteger(row.subtotalCents) ||
    !Number.isInteger(row.platformFeeCents) ||
    row.currency !== "usd" ||
    !Number.isInteger(row.paidAt) ||
    !Array.isArray(row.transfers) ||
    !row.transfers.every(isTransfer)
  ) {
    return false;
  }
  return true;
}

const emptySlips: OrderSlip[] = [];

let cachedRaw: string | null | undefined;
let cachedSlips: OrderSlip[] = emptySlips;

export function parseOrderSlips(raw: string | null | undefined): OrderSlip[] {
  if (!raw) {
    return emptySlips;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return emptySlips;
    }
    const slips = parsed.filter(isOrderSlip);
    return slips.length === 0 ? emptySlips : slips;
  } catch {
    return emptySlips;
  }
}

export function orderSlipFromSession(
  session: CheckoutSessionSummary,
  paidAt = Date.now(),
): OrderSlip {
  return {
    id: session.id,
    mode: session.mode,
    listingIds: [...session.listingIds],
    chargePattern: session.chargePattern,
    subtotalCents: session.subtotalCents,
    platformFeeCents: session.platformFeeCents,
    currency: session.currency,
    buyerEmail: session.buyerEmail,
    buyerName: session.buyerName,
    asIs: session.asIs === true ? true : undefined,
    tender:
      session.tender === "cash" || session.tender === "card"
        ? session.tender
        : undefined,
    transfers: session.transfers.map((transfer) => ({ ...transfer })),
    paidAt,
  };
}

export function orderSlipFromCheckoutCookie(
  cookieValue: string | undefined,
  orderId?: string,
): OrderSlip | null {
  const session = parseCheckoutSession(cookieValue);
  if (!session) {
    return null;
  }
  if (orderId && session.id !== orderId) {
    return null;
  }
  return orderSlipFromSession(session, 0);
}

export function readOrderSlips(): OrderSlip[] {
  if (!canUseStorage()) {
    return emptySlips;
  }
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw === cachedRaw) {
      return cachedSlips;
    }
    cachedRaw = raw;
    cachedSlips = parseOrderSlips(raw);
    return cachedSlips;
  } catch {
    return cachedSlips;
  }
}

export function readOrderSlip(id: string): OrderSlip | undefined {
  if (!id) {
    return undefined;
  }
  return readOrderSlips().find((order) => order.id === id);
}

export function writeOrderSlip(order: OrderSlip) {
  if (!canUseStorage()) {
    return;
  }
  const existing = readOrderSlips();
  const prior = existing.find((item) => item.id === order.id);
  const paidAt =
    prior && prior.paidAt > 0
      ? prior.paidAt
      : order.paidAt > 0
        ? order.paidAt
        : Date.now();
  const next = [
    { ...order, paidAt },
    ...existing.filter((item) => item.id !== order.id),
  ].slice(0, MAX_ORDERS);
  try {
    const raw = JSON.stringify(next);
    window.localStorage.setItem(ORDERS_STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedSlips = next;
  } catch {
    // blocked storage
  }
  window.dispatchEvent(new Event(ORDERS_CHANGED_EVENT));
}

export function subscribeOrderSlips(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === ORDERS_STORAGE_KEY || event.key === null) {
      if (event.key === null) {
        cachedRaw = undefined;
      }
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(ORDERS_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ORDERS_CHANGED_EVENT, listener);
  };
}

export function reconstructOrderGroups(listingIds: string[]): OrderStallGroup[] {
  const groups = new Map<string, OrderStallGroup>();
  const unknown: OrderStallGroup = {
    stallId: "unknown",
    boothName: "Gone from the table",
    lines: [],
  };
  const seen = new Set<string>();

  for (const id of listingIds) {
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);

    const listing = liveListingById(id) ?? null;
    const stall = listing ? (liveStallById(listing.stallId) ?? null) : null;
    const line: OrderLine = { listingId: id, listing, stall };

    if (!listing || !stall) {
      unknown.lines.push(line);
      continue;
    }

    const existing = groups.get(stall.id);
    if (existing) {
      existing.lines.push(line);
    } else {
      groups.set(stall.id, {
        stallId: stall.id,
        boothName: stall.boothName,
        lines: [line],
      });
    }
  }

  const result = [...groups.values()];
  if (unknown.lines.length > 0) {
    result.push(unknown);
  }
  return result;
}

export function orderTitleMix(listingIds: string[]): string {
  const titles = listingIds
    .map((id) => liveListingById(id)?.title)
    .filter((title): title is string => Boolean(title));
  if (titles.length === 0) {
    return listingIds.length === 0
      ? "Empty tote"
      : `${listingIds.length} line${listingIds.length === 1 ? "" : "s"} on the slip`;
  }
  if (titles.length === 1) {
    return titles[0];
  }
  return `${titles[0]} + ${titles.length - 1} more`;
}

export function formatPaidAt(paidAt: number) {
  if (!paidAt) {
    return "Just paid";
  }
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(paidAt));
  } catch {
    return "Paid";
  }
}
