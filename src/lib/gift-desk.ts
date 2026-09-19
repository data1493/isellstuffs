/**
 * Gift desk — one stand-in code, paper stamps only.
 * Never write `iss:cart-listing-ids` or change tote math / `platformFeeOn`.
 * Not a coupon. Not a Stripe Gift. Not a wallet balance.
 *
 * Shape: `{ id, code, amountCents, at }` paper slips.
 * localStorage key `iss:gift-credits` is the client pile.
 * Cookie `iss-gift-credits` is the same JSON for no-JS redeem.
 */
import { formatMoney, money } from "@/lib/commerce";

export const GIFT_CREDITS_STORAGE_KEY = "iss:gift-credits";
export const GIFT_CREDITS_COOKIE = "iss-gift-credits";
export const GIFT_CREDITS_CHANGED_EVENT = "iss:gift-credits-changed";

export const STAND_IN_GIFT_CODE = "MALL-GIFT-25-DESK";
export const STAND_IN_GIFT_CENTS = 2500;
export const STAND_IN_GIFT_CREDIT_ID = "gift-mall-gift-25-desk";

export const GIFT_STAMP_COPY = "$25 mall credit · Gift Desk · on paper.";

export type GiftCredit = {
  id: string;
  code: string;
  amountCents: number;
  at: string;
};

export type GiftRedeemResult =
  | { ok: true; minted: boolean; credit: GiftCredit; credits: GiftCredit[] }
  | { ok: false; reason: "empty" | "unknown"; credits: GiftCredit[] };

function canUseStorage() {
  return typeof window !== "undefined";
}

export function normalizeGiftCode(raw: string) {
  return raw.trim().toUpperCase();
}

export function isStandInGiftCode(raw: string) {
  return normalizeGiftCode(raw) === STAND_IN_GIFT_CODE;
}

function isGiftCredit(value: unknown): value is GiftCredit {
  if (!value || typeof value !== "object") {
    return false;
  }
  const credit = value as GiftCredit;
  return (
    typeof credit.id === "string" &&
    credit.id.length > 0 &&
    typeof credit.code === "string" &&
    Number.isInteger(credit.amountCents) &&
    credit.amountCents > 0 &&
    typeof credit.at === "string"
  );
}

export function parseGiftCredits(raw: string | null | undefined): GiftCredit[] {
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
    return parsed.filter(isGiftCredit);
  } catch {
    return [];
  }
}

export function serializeGiftCredits(credits: GiftCredit[]) {
  return JSON.stringify(credits);
}

export function creditForCode(credits: GiftCredit[], raw: string) {
  const code = normalizeGiftCode(raw);
  if (!code) {
    return undefined;
  }
  return credits.find((credit) => normalizeGiftCode(credit.code) === code);
}

export function createStandInGiftCredit(at = new Date().toISOString()): GiftCredit {
  return {
    id: STAND_IN_GIFT_CREDIT_ID,
    code: STAND_IN_GIFT_CODE,
    amountCents: STAND_IN_GIFT_CENTS,
    at,
  };
}

export function existingStandInCredit(credits: GiftCredit[]) {
  return (
    creditForCode(credits, STAND_IN_GIFT_CODE) ??
    credits.find((credit) => credit.id === STAND_IN_GIFT_CREDIT_ID)
  );
}

export function redeemGiftCode(
  existing: GiftCredit[],
  raw: string,
): GiftRedeemResult {
  const trimmed = raw.trim();
  const found = existingStandInCredit(existing);

  // Empty submit with a stamp already on this desk is the same slip, not a miss.
  if (!trimmed) {
    if (found) {
      return { ok: true, minted: false, credit: found, credits: existing };
    }
    return { ok: false, reason: "empty", credits: existing };
  }
  if (!isStandInGiftCode(trimmed)) {
    return { ok: false, reason: "unknown", credits: existing };
  }

  if (found) {
    return { ok: true, minted: false, credit: found, credits: existing };
  }

  const credit = createStandInGiftCredit();
  return {
    ok: true,
    minted: true,
    credit,
    credits: [...existing, credit],
  };
}

export function giftCreditLabel(credit: GiftCredit) {
  return formatMoney(money(credit.amountCents));
}

export function readGiftCredits(): GiftCredit[] {
  if (!canUseStorage()) {
    return [];
  }
  try {
    const fromStorage = parseGiftCredits(
      window.localStorage.getItem(GIFT_CREDITS_STORAGE_KEY),
    );
    if (fromStorage.length > 0) {
      return fromStorage;
    }
  } catch {
    // blocked storage
  }
  return [];
}

export function writeGiftCredits(credits: GiftCredit[]) {
  if (!canUseStorage()) {
    return;
  }
  const raw = serializeGiftCredits(credits);
  try {
    window.localStorage.setItem(GIFT_CREDITS_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${GIFT_CREDITS_COOKIE}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  window.dispatchEvent(new Event(GIFT_CREDITS_CHANGED_EVENT));
}

export function mergeGiftCredits(
  existing: GiftCredit[],
  incoming: GiftCredit[],
): GiftCredit[] {
  const byId = new Map<string, GiftCredit>();
  for (const credit of existing) {
    byId.set(credit.id, credit);
  }
  for (const credit of incoming) {
    const prior = byId.get(credit.id);
    byId.set(credit.id, prior ?? credit);
  }
  return [...byId.values()];
}

export function subscribeGiftCredits(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === GIFT_CREDITS_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(GIFT_CREDITS_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GIFT_CREDITS_CHANGED_EVENT, listener);
  };
}
