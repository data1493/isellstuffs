/**
 * Paper haggle scrap on a physical listing. Digital files have no offer.
 * Never write tote / sold / file-gone / packed keys. Does not change
 * `listing.price` or tote math. The tag stays the tag.
 *
 * Shape: `{ id, listingId, stallId, amountCents, at }` scraps.
 * localStorage key `iss:listing-offers` is the client cork.
 * Cookie `iss-listing-offers` is the same JSON so the slip and desk can SSR it.
 */
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  isPhysicalListing,
  listingById,
  money,
  stallById,
  type Listing,
} from "@/lib/commerce";
import { listingHubName, listingStatusLabel } from "@/lib/listing-display";

export const OFFER_STORAGE_KEY = "iss:listing-offers";
export const OFFER_COOKIE_NAME = "iss-listing-offers";
export const OFFER_CHANGED_EVENT = "iss:listing-offers-changed";

export const OFFER_BOARD_MAX = 20;
export const OFFER_AMOUNT_MAX_CENTS = 999_999;

export const OFFER_MISSING_COPY = "No offer for that listing.";
export const OFFER_FILE_COPY = "No offer on a file.";
export const OFFER_GIFT_COPY = "No offer on a gift card.";
export const OFFER_PAPER_LINE = "A scrap on the lamp. Not a new price.";
export const OFFER_TOTE_LINE = "The tote still rings the tag.";
export const OFFER_SOLD_COPY = "It already walked. The tag is not taking scraps.";
export const DIGITAL_FOLDER_LINE = "Opens in the folder after pay.";
export const GIFT_DESK_LINE = "Code goes to the gift desk.";

export type ListingOffer = {
  id: string;
  listingId: string;
  stallId: string;
  amountCents: number;
  at: string;
};

export type OfferSheetKind = "physical" | "digital" | "gift" | "missing";

export type OfferSheet = {
  kind: OfferSheetKind;
  listingId: string;
  title: string | null;
  tagLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  stallId: string | null;
  hubName: string | null;
  statusWord: string | null;
  refuse: string;
  canTape: boolean;
  listing: Listing | null;
};

export type TapeOfferResult =
  | { ok: true; offer: ListingOffer; offers: ListingOffer[] }
  | {
      ok: false;
      reason: "empty" | "missing" | "file" | "gift" | "sold";
      offers: ListingOffer[];
    };

function canUseStorage() {
  return typeof window !== "undefined";
}

export function parseOfferAmount(raw: string): number | null {
  const trimmed = raw.trim().replace(/[$,\s]/g, "");
  if (!trimmed) {
    return null;
  }
  const dollars = Number(trimmed);
  if (!Number.isFinite(dollars) || dollars <= 0) {
    return null;
  }
  const amountCents = Math.round(dollars * 100);
  if (
    !Number.isInteger(amountCents) ||
    amountCents <= 0 ||
    amountCents > OFFER_AMOUNT_MAX_CENTS
  ) {
    return null;
  }
  return amountCents;
}

function isListingOffer(value: unknown): value is ListingOffer {
  if (!value || typeof value !== "object") {
    return false;
  }
  const offer = value as ListingOffer;
  return (
    typeof offer.id === "string" &&
    offer.id.length > 0 &&
    typeof offer.listingId === "string" &&
    offer.listingId.length > 0 &&
    typeof offer.stallId === "string" &&
    offer.stallId.length > 0 &&
    Number.isInteger(offer.amountCents) &&
    offer.amountCents > 0 &&
    typeof offer.at === "string"
  );
}

export function parseListingOffers(raw: string | null | undefined): ListingOffer[] {
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
    return parsed.filter(isListingOffer);
  } catch {
    return [];
  }
}

export function serializeListingOffers(offers: ListingOffer[]) {
  return JSON.stringify(offers);
}

export function createOfferId(at = new Date()) {
  const stamp = at.getTime().toString(36);
  const salt = Math.random().toString(36).slice(2, 6);
  return `offer-${stamp}${salt}`;
}

export function createOffer(
  listing: Listing,
  amountCents: number,
  at = new Date(),
): ListingOffer {
  return {
    id: createOfferId(at),
    listingId: listing.id,
    stallId: listing.stallId,
    amountCents,
    at: at.toISOString(),
  };
}

export function tapeOffer(
  existing: ListingOffer[],
  listingId: string,
  rawAmount: string,
): TapeOfferResult {
  const listing = listingById(listingId);

  if (!listing) {
    return { ok: false, reason: "missing", offers: existing };
  }

  if (isDigitalListing(listing)) {
    return {
      ok: false,
      reason: isGiftListing(listing) ? "gift" : "file",
      offers: existing,
    };
  }

  if (!isPhysicalListing(listing) || listing.status !== "available") {
    return { ok: false, reason: "sold", offers: existing };
  }

  const amountCents = parseOfferAmount(rawAmount);
  if (amountCents === null) {
    return { ok: false, reason: "empty", offers: existing };
  }

  const offer = createOffer(listing, amountCents);
  return {
    ok: true,
    offer,
    offers: [offer, ...existing].slice(0, OFFER_BOARD_MAX),
  };
}

export function peelOffer(existing: ListingOffer[], offerId: string): ListingOffer[] {
  if (!offerId) {
    return existing;
  }
  return existing.filter((offer) => offer.id !== offerId);
}

export function offersForListing(offers: ListingOffer[], listingId: string) {
  return offers.filter((offer) => offer.listingId === listingId);
}

export function offersForStall(offers: ListingOffer[], stallId: string) {
  return offers.filter((offer) => offer.stallId === stallId);
}

export function mergeListingOffers(
  existing: ListingOffer[],
  incoming: ListingOffer[],
): ListingOffer[] {
  const byId = new Map<string, ListingOffer>();
  for (const offer of incoming) {
    byId.set(offer.id, offer);
  }
  for (const offer of existing) {
    if (!byId.has(offer.id)) {
      byId.set(offer.id, offer);
    }
  }
  return [...byId.values()]
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
    .slice(0, OFFER_BOARD_MAX);
}

function cookieRaw(): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (part.startsWith(`${OFFER_COOKIE_NAME}=`)) {
      return part.slice(OFFER_COOKIE_NAME.length + 1);
    }
  }
  return null;
}

export function readListingOffers(): ListingOffer[] {
  if (!canUseStorage()) {
    return [];
  }
  const fromCookie = cookieRaw();
  if (fromCookie !== null) {
    return parseListingOffers(fromCookie);
  }
  try {
    return parseListingOffers(window.localStorage.getItem(OFFER_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function writeListingOffers(offers: ListingOffer[]) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeListingOffers(offers);
  try {
    window.localStorage.setItem(OFFER_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${OFFER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(OFFER_CHANGED_EVENT));
}

export function subscribeListingOffers(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === OFFER_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(OFFER_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(OFFER_CHANGED_EVENT, listener);
  };
}

export function formatOfferAmount(amountCents: number) {
  return formatMoney(money(amountCents));
}

export function offerSheetForId(id: string): OfferSheet {
  const listing = listingById(id);

  if (!listing) {
    return {
      kind: "missing",
      listingId: id,
      title: null,
      tagLabel: null,
      fact: null,
      stallName: null,
      stallSlug: null,
      stallId: null,
      hubName: null,
      statusWord: null,
      refuse: OFFER_MISSING_COPY,
      canTape: false,
      listing: null,
    };
  }

  const stall = stallById(listing.stallId);
  const stallName = stall?.boothName ?? listing.stallId;
  const hubName = listingHubName(listing);
  const worn =
    listing.status === "sold" || listing.status === "file-gone"
      ? listingStatusLabel(listing)
      : null;

  if (isPhysicalListing(listing)) {
    return {
      kind: "physical",
      listingId: listing.id,
      title: listing.title,
      tagLabel: formatMoney(listing.price),
      fact: listing.condition,
      stallName,
      stallSlug: stall?.slug ?? null,
      stallId: listing.stallId,
      hubName,
      statusWord: worn,
      refuse: listing.status === "available" ? OFFER_PAPER_LINE : OFFER_SOLD_COPY,
      canTape: listing.status === "available",
      listing,
    };
  }

  if (isDigitalListing(listing)) {
    const gift = isGiftListing(listing);
    return {
      kind: gift ? "gift" : "digital",
      listingId: listing.id,
      title: listing.title,
      tagLabel: formatMoney(listing.price),
      fact: listing.fileFormat,
      stallName,
      stallSlug: stall?.slug ?? null,
      stallId: listing.stallId,
      hubName,
      statusWord: worn,
      refuse: gift ? OFFER_GIFT_COPY : OFFER_FILE_COPY,
      canTape: false,
      listing,
    };
  }

  return {
    kind: "missing",
    listingId: id,
    title: null,
    tagLabel: null,
    fact: null,
    stallName: null,
    stallSlug: null,
    stallId: null,
    hubName: null,
    statusWord: null,
    refuse: OFFER_MISSING_COPY,
    canTape: false,
    listing: null,
  };
}
