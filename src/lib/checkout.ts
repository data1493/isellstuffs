import {
  addMoney,
  formatMoney,
  isCartEligible,
  listingById,
  money,
  stallById,
  type Listing,
  type Money,
  type Stall,
} from "@/lib/commerce";

/** Stand-in mall cut. Separate charges and transfers retain this — no application_fee_amount. */
export const PLATFORM_FEE_BPS = 1000;

export const CHECKOUT_COOKIE = "iss-checkout";
export const CHECKOUT_COOKIE_MAX_AGE = 60 * 30;

export const CHARGE_PATTERN = "separate_charges_and_transfers" as const;

export type ChargePattern = typeof CHARGE_PATTERN;

export type CheckoutMode = "stripe-test" | "local-mock";

export type CheckoutLine = {
  listing: Listing;
  stall: Stall;
};

export type StallTransferPlan = {
  stallId: string;
  boothName: string;
  /** Fixture only. Not a live connected account — no onboarding in this wave. */
  mockConnectedAccountId: string;
  subtotal: Money;
  platformFee: Money;
  /** Amount the stall would receive after the mall keeps its cut. */
  transferAmount: Money;
};

export type CheckoutPlan = {
  chargePattern: ChargePattern;
  lines: CheckoutLine[];
  subtotal: Money;
  platformFee: Money;
  sellerTransfers: StallTransferPlan[];
};

export type CheckoutSessionSummary = {
  id: string;
  mode: CheckoutMode;
  listingIds: string[];
  chargePattern: ChargePattern;
  subtotalCents: number;
  platformFeeCents: number;
  currency: Money["currency"];
  buyerEmail?: string;
  buyerName?: string;
  /** Physical slips only. Set when the buyer eats the condition at the register. */
  asIs?: boolean;
  /** Physical slips only. Cash on the table vs card theater. Digital stays card. */
  tender?: "cash" | "card";
  transfers: Array<{
    stallId: string;
  boothName: string;
    destination: string;
    amountCents: number;
  }>;
};

export class CheckoutError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CheckoutError";
    this.status = status;
  }
}

export function mockConnectedAccountId(stallId: string): string {
  return `acct_test_${stallId}`;
}

export function platformFeeOn(subtotal: Money): Money {
  const raw = Math.round((subtotal.amountCents * PLATFORM_FEE_BPS) / 10_000);
  const capped = Math.min(raw, Math.max(0, subtotal.amountCents));
  return money(capped, subtotal.currency);
}

export function resolveCheckoutLines(listingIds: string[]): CheckoutLine[] {
  if (listingIds.length === 0) {
    throw new CheckoutError("The tote is empty.");
  }

  const seen = new Set<string>();
  const lines: CheckoutLine[] = [];

  for (const id of listingIds) {
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);

    const listing = listingById(id);
    if (!listing) {
      throw new CheckoutError(`Unknown listing: ${id}`);
    }
    if (!isCartEligible(listing)) {
      throw new CheckoutError(`${listing.title} is not for sale.`);
    }

    const stall = stallById(listing.stallId);
    if (!stall) {
      throw new CheckoutError(`Missing stall for ${listing.title}.`);
    }

    lines.push({ listing, stall });
  }

  return lines;
}

export function buildCheckoutPlan(listingIds: string[]): CheckoutPlan {
  const lines = resolveCheckoutLines(listingIds);
  const currency = lines[0].listing.price.currency;

  const byStall = new Map<string, CheckoutLine[]>();
  for (const line of lines) {
    const group = byStall.get(line.stall.id) ?? [];
    group.push(line);
    byStall.set(line.stall.id, group);
  }

  const sellerTransfers: StallTransferPlan[] = [];
  let subtotal = money(0, currency);
  let platformFee = money(0, currency);

  for (const [stallId, stallLines] of byStall) {
    const stall = stallLines[0].stall;
    const stallSubtotal = stallLines.reduce(
      (sum, line) => addMoney(sum, line.listing.price),
      money(0, currency),
    );
    const stallFee = platformFeeOn(stallSubtotal);
    const transferAmount = money(
      stallSubtotal.amountCents - stallFee.amountCents,
      currency,
    );

    sellerTransfers.push({
      stallId,
      boothName: stall.boothName,
      mockConnectedAccountId: mockConnectedAccountId(stallId),
      subtotal: stallSubtotal,
      platformFee: stallFee,
      transferAmount,
    });

    subtotal = addMoney(subtotal, stallSubtotal);
    platformFee = addMoney(platformFee, stallFee);
  }

  return {
    chargePattern: CHARGE_PATTERN,
    lines,
    subtotal,
    platformFee,
    sellerTransfers,
  };
}

export function summarizePlan(
  id: string,
  mode: CheckoutMode,
  plan: CheckoutPlan,
): CheckoutSessionSummary {
  return {
    id,
    mode,
    listingIds: plan.lines.map((line) => line.listing.id),
    chargePattern: plan.chargePattern,
    subtotalCents: plan.subtotal.amountCents,
    platformFeeCents: plan.platformFee.amountCents,
    currency: plan.subtotal.currency,
    transfers: plan.sellerTransfers.map((transfer) => ({
      stallId: transfer.stallId,
      boothName: transfer.boothName,
      destination: transfer.mockConnectedAccountId,
      amountCents: transfer.transferAmount.amountCents,
    })),
  };
}

export function serializeCheckoutSession(session: CheckoutSessionSummary): string {
  return JSON.stringify(session);
}

export function parseCheckoutSession(
  value: string | undefined,
): CheckoutSessionSummary | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<CheckoutSessionSummary>;
    if (
      typeof parsed.id !== "string" ||
      (parsed.mode !== "stripe-test" && parsed.mode !== "local-mock") ||
      !Array.isArray(parsed.listingIds)
    ) {
      return null;
    }
    if (parsed.asIs === true) {
      parsed.asIs = true;
    } else {
      delete parsed.asIs;
    }
    if (parsed.tender === "cash" || parsed.tender === "card") {
      parsed.tender = parsed.tender;
    } else {
      delete parsed.tender;
    }
    return parsed as CheckoutSessionSummary;
  } catch {
    return null;
  }
}

export function formatPlanMoney(amountCents: number, currency: Money["currency"] = "usd") {
  return formatMoney(money(amountCents, currency));
}

function randomLetterSuffix(length = 8): string {
  const letters = "abcdefghijkmnpqrstuvwxyz";
  let suffix = "";
  for (let i = 0; i < length; i += 1) {
    suffix += letters[Math.floor(Math.random() * letters.length)];
  }
  return suffix;
}

export function integrationIdentifier(): string {
  return `iss-mall-${randomLetterSuffix()}`;
}

export class LiveStripeKeyError extends CheckoutError {
  constructor() {
    super("Live Stripe keys are not allowed. Use a test key or omit it for the local mock.", 400);
    this.name = "LiveStripeKeyError";
  }
}

/** Test secret only. Missing or unknown values fall back to the local mock. */
export function readStripeTestSecret(): string | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    return null;
  }
  if (key.startsWith("sk_live_") || key.startsWith("rk_live_")) {
    throw new LiveStripeKeyError();
  }
  if (key.startsWith("sk_test_") || key.startsWith("rk_test_")) {
    return key;
  }
  return null;
}

export function checkoutMode(): CheckoutMode {
  return readStripeTestSecret() ? "stripe-test" : "local-mock";
}
