/**
 * Home paid corners from next-weekend bookings.
 *
 * Cookie `iss-ad-bookings` is written by POST /advertise/book/pay.
 * Explore and hub aisles stay on catalog fixtures — do not import this there.
 */
import {
  nextWindowPackageByKind,
  parseAdBookings,
  type AdBooking,
} from "@/lib/ad-booking";
import {
  adSlotsByKind,
  allStalls,
  featuredStallSlots,
  stallById,
  type AdSlot,
} from "@/lib/commerce";

export type HomePaidKind = "featured-stall" | "homepage-takeover";

export type HomePaidPlacement = {
  slot: AdSlot;
  stallName: string;
  fromBooking: boolean;
};

function stallIdForName(stallName: string): string | undefined {
  const needle = stallName.trim().toLowerCase();
  if (!needle) {
    return undefined;
  }
  return allStalls().find((stall) => stall.boothName.toLowerCase() === needle)
    ?.id;
}

function latestBookingForKind(
  bookings: readonly AdBooking[],
  kind: HomePaidKind,
): AdBooking | undefined {
  return bookings.find((booking) => booking.kind === kind);
}

function headlineForBooking(booking: AdBooking): string {
  if (booking.kind === "homepage-takeover") {
    return `Homepage takeover: ${booking.stallName}`;
  }
  return `Paid the good corner: ${booking.stallName}`;
}

function slotFromBooking(booking: AdBooking): AdSlot {
  const pack = nextWindowPackageByKind(booking.kind);
  const stallId = stallIdForName(booking.stallName) ?? "";

  return {
    id: booking.id,
    kind: booking.kind,
    labeled: true,
    stallId,
    headline: headlineForBooking(booking),
    blurb: pack?.blurb ?? "Paid corner. Labeled.",
    packageName: booking.packageName,
    price: booking.price,
    window: booking.window,
    ...(booking.kind === "hub-takeover" && booking.hubId
      ? { hubId: booking.hubId }
      : {}),
  };
}

function placementFromFixture(slot: AdSlot | undefined): HomePaidPlacement | undefined {
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

function resolveHomeKind(
  bookings: readonly AdBooking[],
  kind: HomePaidKind,
  fixture: AdSlot | undefined,
): HomePaidPlacement | undefined {
  const booking = latestBookingForKind(bookings, kind);
  if (!booking) {
    return placementFromFixture(fixture);
  }
  return {
    slot: slotFromBooking(booking),
    stallName: booking.stallName,
    fromBooking: true,
  };
}

export function homeBookingsFromCookie(
  raw: string | null | undefined,
): AdBooking[] {
  return parseAdBookings(raw);
}

export function resolveHomeTakeover(
  bookings: readonly AdBooking[],
): HomePaidPlacement | undefined {
  return resolveHomeKind(
    bookings,
    "homepage-takeover",
    adSlotsByKind("homepage-takeover")[0],
  );
}

export function resolveHomeFeatured(
  bookings: readonly AdBooking[],
): HomePaidPlacement | undefined {
  return resolveHomeKind(bookings, "featured-stall", featuredStallSlots()[0]);
}
