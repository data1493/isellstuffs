/**
 * Take-home souvenir for a paid next-weekend booking.
 * Reads `iss:ad-bookings` / `iss-ad-bookings`. Does not paint home slots.
 */
import { adKindCopy } from "@/lib/ads-display";
import {
  bookingPriceLabel,
  parseAdBookings,
  type AdBooking,
  NEXT_WINDOW,
} from "@/lib/ad-booking";
import { hubById } from "@/lib/commerce";

export type AdFlyerSheet = {
  id: string;
  stallName: string;
  packageName: string;
  product: string;
  window: typeof NEXT_WINDOW;
  priceLabel: string;
  /** Locked hub name — only when this booking is a hub takeover. */
  aisle: string | null;
  labeled: true;
};

export function decodeFlyerBookingId(raw: string) {
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

export function findAdBooking(
  bookings: readonly AdBooking[],
  bookingId: string,
): AdBooking | undefined {
  const id = bookingId.trim();
  if (!id) {
    return undefined;
  }
  return bookings.find((booking) => booking.id === id);
}

export function flyerFromCookie(
  raw: string | null | undefined,
  bookingId: string,
): AdBooking | undefined {
  return findAdBooking(parseAdBookings(raw), bookingId);
}

export function bookingToFlyer(booking: AdBooking): AdFlyerSheet {
  const hub =
    booking.kind === "hub-takeover" && booking.hubId
      ? hubById(booking.hubId)
      : undefined;

  return {
    id: booking.id,
    stallName: booking.stallName,
    packageName: booking.packageName,
    product: adKindCopy[booking.kind].product,
    window: booking.window,
    priceLabel: bookingPriceLabel(booking.price),
    aisle: hub?.name ?? null,
    labeled: true,
  };
}
