/**
 * As-is at the register. Physical finds are driveway goods.
 * The mall does not take them back. Not a refund desk. Not a coupon.
 *
 * Digital-only and gift-only slips skip the box.
 * Never change tote math or `platformFeeOn`.
 */
import { CheckoutError, type CheckoutSessionSummary } from "@/lib/checkout";
import { isPhysicalListing, listingById } from "@/lib/commerce";

export const AS_IS_REJECT = "Eat the condition or leave the lamp.";

export const AS_IS_CHECK_LABEL =
  "As-is. I walked the crack. The mall does not take it back.";

export const AS_IS_STAMP =
  "As-is at the register. Driveway handoff. Not a return desk.";

export function slipHasPhysicalLines(listingIds: readonly string[]): boolean {
  return listingIds.some((id) => {
    const listing = listingById(id);
    return Boolean(listing && isPhysicalListing(listing));
  });
}

export function readAsIsFlag(value: unknown): boolean {
  if (value === true || value === 1) {
    return true;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "on" || normalized === "true";
  }
  return false;
}

export function asIsOnSlip(
  session: Pick<CheckoutSessionSummary, "asIs"> | null | undefined,
): boolean {
  return session?.asIs === true;
}

export function stampAsIs(
  session: CheckoutSessionSummary,
): CheckoutSessionSummary {
  return { ...session, asIs: true };
}

/** Physical slips must eat the condition. Digital / gift skip. */
export function assertPhysicalAsIs(
  listingIds: readonly string[],
  asIs: boolean,
) {
  if (slipHasPhysicalLines(listingIds) && !asIs) {
    throw new CheckoutError(AS_IS_REJECT);
  }
}
