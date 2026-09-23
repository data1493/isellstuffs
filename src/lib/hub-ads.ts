/**
 * Hub aisle heroes from next-weekend hub-takeover bookings.
 *
 * Cookie `iss-ad-bookings` is written by POST /advertise/book/pay.
 * Featured and homepage-takeover stay on home — do not import this there.
 */
import {
  nextWindowPackageByKind,
  parseAdBookings,
  type AdBooking,
} from "@/lib/ad-booking";
import {
  adSlots,
  allStalls,
  stallById,
  type AdSlot,
  type HubId,
} from "@/lib/commerce";

export type HubAislePlacement = {
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

function fixtureForHub(hubId: HubId): AdSlot | undefined {
  return adSlots.find(
    (slot) => slot.kind === "hub-takeover" && slot.hubId === hubId,
  );
}

function latestHubBooking(
  bookings: readonly AdBooking[],
  hubId: HubId,
): AdBooking | undefined {
  return bookings.find(
    (booking) => booking.kind === "hub-takeover" && booking.hubId === hubId,
  );
}

function slotFromBooking(booking: AdBooking, hubId: HubId): AdSlot {
  const pack = nextWindowPackageByKind("hub-takeover");
  const stallId = stallIdForName(booking.stallName) ?? "";

  return {
    id: booking.id,
    kind: "hub-takeover",
    labeled: true,
    stallId,
    hubId,
    headline: `Hub takeover: ${booking.stallName}`,
    blurb: "You bought light, not a rewrite.",
    packageName: booking.packageName,
    price: booking.price,
    window: booking.window,
  };
}

function placementFromFixture(
  slot: AdSlot | undefined,
): HubAislePlacement | undefined {
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

export function hubBookingsFromCookie(
  raw: string | null | undefined,
): AdBooking[] {
  return parseAdBookings(raw);
}

export function resolveHubTakeover(
  bookings: readonly AdBooking[],
  hubId: HubId,
): HubAislePlacement | undefined {
  const booking = latestHubBooking(bookings, hubId);
  if (!booking) {
    return placementFromFixture(fixtureForHub(hubId));
  }
  return {
    slot: slotFromBooking(booking, hubId),
    stallName: booking.stallName,
    fromBooking: true,
  };
}
