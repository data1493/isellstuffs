/**
 * Cash vs card on mock pay. Driveway money used to be card theater only.
 * Physical slips can hand bills at the table. Digital / gift stay on the card.
 * Never change tote math or `platformFeeOn`. Not a seller-desk cash ledger.
 */
import { CheckoutError, type CheckoutSessionSummary } from "@/lib/checkout";
import { isPhysicalListing, listingById } from "@/lib/commerce";

export type DrivewayTender = "cash" | "card";

export const CASH_STAMP = "Cash on the table.";

export const CASH_SLIP_COPY =
  "Cash on the table. Not a card. Bills at the driveway. The mall still takes 10% on paper.";

export const CASH_LABEL = "Cash on the table";

export const CARD_LABEL = "Card (test)";

export const CASH_HELP =
  "Bills at the driveway. The mall still takes 10% on paper. Not Stripe.";

export const CARD_HELP =
  "Same test card as before. Stripe.js theater. Nothing live.";

export const CASH_REJECT = "Cash is for the driveway. Files stay on the card.";

export function slipAllowsCash(listingIds: readonly string[]): boolean {
  return listingIds.some((id) => {
    const listing = listingById(id);
    return Boolean(listing && isPhysicalListing(listing));
  });
}

export function readTender(value: unknown): DrivewayTender {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "cash") {
      return "cash";
    }
    if (normalized === "card") {
      return "card";
    }
  }
  return "card";
}

export function tenderOnSlip(
  session: Pick<CheckoutSessionSummary, "tender"> | null | undefined,
): DrivewayTender {
  return session?.tender === "cash" ? "cash" : "card";
}

export function isCashOnTable(
  session: Pick<CheckoutSessionSummary, "tender"> | null | undefined,
): boolean {
  return tenderOnSlip(session) === "cash";
}

export function stampTender(
  session: CheckoutSessionSummary,
  tender: DrivewayTender,
): CheckoutSessionSummary {
  return { ...session, tender };
}

const MOCK_TENDER_EVENT = "iss:mock-tender";
const mockTenderMemory = new Map<string, DrivewayTender>();

export function mockTenderStorageKey(sessionId: string) {
  return `iss:mock-tender:${sessionId}`;
}

/** Same-tab mock-pay choice. Survives a remount. Not the paid slip. */
export function readMockTender(sessionId: string): DrivewayTender {
  const remembered = mockTenderMemory.get(sessionId);
  if (remembered) {
    return remembered;
  }
  if (typeof window === "undefined") {
    return "card";
  }
  try {
    const raw = window.sessionStorage.getItem(mockTenderStorageKey(sessionId));
    if (raw === "cash" || raw === "card") {
      mockTenderMemory.set(sessionId, raw);
      return raw;
    }
  } catch {
    // blocked
  }
  return "card";
}

export function writeMockTender(sessionId: string, tender: DrivewayTender) {
  mockTenderMemory.set(sessionId, tender);
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.setItem(mockTenderStorageKey(sessionId), tender);
  } catch {
    // blocked
  }
  window.dispatchEvent(new Event(MOCK_TENDER_EVENT));
}

export function subscribeMockTender(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener(MOCK_TENDER_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(MOCK_TENDER_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Cash is driveway-only. Digital / gift slips stay on the card. */
export function assertDrivewayTender(
  listingIds: readonly string[],
  tender: DrivewayTender,
) {
  if (tender === "cash" && !slipAllowsCash(listingIds)) {
    throw new CheckoutError(CASH_REJECT);
  }
}
