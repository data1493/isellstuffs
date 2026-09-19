/**
 * Featured-stall paint from next-weekend bookings.
 *
 * Cookie `iss-ad-bookings` is written by POST /advertise/book/pay.
 * Home and hub aisles keep their own helpers — do not import this there.
 * Only featured-stall. Homepage-takeover and hub-takeover stay off explore.
 */
import {
  nextWindowPackageByKind,
  parseAdBookings,
  type AdBooking,
} from "@/lib/ad-booking";
import {
  allStalls,
  featuredStallSlots,
  stallById,
  type AdSlot,
  type Stall,
} from "@/lib/commerce";

export type FeaturedPlacement = {
  slot: AdSlot;
  stallName: string;
  fromBooking: boolean;
};

function stallForBookingName(stallName: string): Stall | undefined {
  const needle = stallName.trim().toLowerCase();
  if (!needle) {
    return undefined;
  }
  return allStalls().find(
    (stall) =>
      stall.boothName.toLowerCase() === needle ||
      stall.slug.toLowerCase() === needle,
  );
}

function latestFeaturedBooking(
  bookings: readonly AdBooking[],
): AdBooking | undefined {
  return bookings.find((booking) => booking.kind === "featured-stall");
}

function slotFromBooking(booking: AdBooking): AdSlot {
  const pack = nextWindowPackageByKind("featured-stall");
  const stall = stallForBookingName(booking.stallName);

  return {
    id: booking.id,
    kind: "featured-stall",
    labeled: true,
    stallId: stall?.id ?? "",
    headline: `Paid the good corner: ${booking.stallName}`,
    blurb: pack?.blurb ?? "Paid corner. Labeled.",
    packageName: booking.packageName,
    price: booking.price,
    window: booking.window,
  };
}

function placementFromFixture(
  slot: AdSlot | undefined,
): FeaturedPlacement | undefined {
  if (!slot) {
    return undefined;
  }
  const stall = stallById(slot.stallId);
  return {
    slot,
    stallName: stall?.boothName ?? slot.stallId,
    fromBooking: false,
  };
}

export function featuredBookingsFromCookie(
  raw: string | null | undefined,
): AdBooking[] {
  return parseAdBookings(raw);
}

export function resolveFeaturedStall(
  bookings: readonly AdBooking[],
): FeaturedPlacement | undefined {
  const booking = latestFeaturedBooking(bookings);
  if (!booking) {
    return placementFromFixture(featuredStallSlots()[0]);
  }
  return {
    slot: slotFromBooking(booking),
    stallName: booking.stallName,
    fromBooking: true,
  };
}

/** Chip + aside only when this booth is the current featured placement. */
export function resolveFeaturedForStall(
  bookings: readonly AdBooking[],
  stall: Stall,
): FeaturedPlacement | undefined {
  const featured = resolveFeaturedStall(bookings);
  if (!featured || featured.slot.stallId !== stall.id) {
    return undefined;
  }
  return featured;
}
