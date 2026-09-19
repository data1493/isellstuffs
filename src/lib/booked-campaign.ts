/**
 * Souvenir campaign URLs from next-weekend bookings.
 * Reads `iss:ad-bookings` / `iss-ad-bookings`. Does not paint home or hub slots.
 */
import {
  nextWindowPackageByKind,
  parseAdBookings,
  type AdBooking,
} from "@/lib/ad-booking";
import {
  homepageBeatsCampaign,
  yardSaleTuesdayCampaign,
} from "@/lib/ads-display";
import {
  adSlots,
  allStalls,
  stallById,
  type AdSlot,
} from "@/lib/commerce";
import { campaignPath } from "@/lib/paths";

export type CampaignLanderSlug =
  | typeof homepageBeatsCampaign.slug
  | typeof yardSaleTuesdayCampaign.slug;

export type CampaignLander = {
  slug: CampaignLanderSlug;
  stallName: string;
  fromBooking: boolean;
  booking?: AdBooking;
  slot: AdSlot;
};

function stallIdForName(stallName: string): string | undefined {
  const needle = stallName.trim().toLowerCase();
  if (!needle) {
    return undefined;
  }
  return allStalls().find((stall) => stall.boothName.toLowerCase() === needle)
    ?.id;
}

function homepageFixture(): AdSlot | undefined {
  return adSlots.find((slot) => slot.id === homepageBeatsCampaign.slotId);
}

function yardSaleFixture(): AdSlot | undefined {
  return adSlots.find((slot) => slot.id === yardSaleTuesdayCampaign.slotId);
}

function latestHomepageTakeover(
  bookings: readonly AdBooking[],
): AdBooking | undefined {
  return bookings.find((booking) => booking.kind === "homepage-takeover");
}

function latestYardSaleHubTakeover(
  bookings: readonly AdBooking[],
): AdBooking | undefined {
  return bookings.find(
    (booking) =>
      booking.kind === "hub-takeover" && booking.hubId === "yard-sale",
  );
}

function slotFromHomepageBooking(booking: AdBooking, fixture: AdSlot): AdSlot {
  const pack = nextWindowPackageByKind("homepage-takeover");
  return {
    id: booking.id,
    kind: "homepage-takeover",
    labeled: true,
    stallId: stallIdForName(booking.stallName) ?? "",
    headline: `Homepage takeover: ${booking.stallName}`,
    blurb: pack?.blurb ?? fixture.blurb,
    packageName: booking.packageName,
    price: booking.price,
    window: booking.window,
  };
}

function slotFromYardSaleBooking(booking: AdBooking, fixture: AdSlot): AdSlot {
  const pack = nextWindowPackageByKind("hub-takeover");
  return {
    id: booking.id,
    kind: "hub-takeover",
    labeled: true,
    stallId: stallIdForName(booking.stallName) ?? "",
    hubId: "yard-sale",
    headline: `Hub takeover: ${booking.stallName}`,
    blurb: pack?.blurb ?? fixture.blurb,
    packageName: booking.packageName,
    price: booking.price,
    window: booking.window,
  };
}

function fixtureLander(
  slug: CampaignLanderSlug,
  slot: AdSlot,
): CampaignLander {
  const stall = stallById(slot.stallId);
  return {
    slug,
    stallName: stall?.boothName ?? slot.stallId,
    fromBooking: false,
    slot,
  };
}

export function campaignBookingsFromCookie(
  raw: string | null | undefined,
): AdBooking[] {
  return parseAdBookings(raw);
}

/** Fixture souvenir URL this booking bought — featured has none. */
export function campaignPathForBooking(
  booking: AdBooking,
): string | undefined {
  if (booking.kind === "homepage-takeover") {
    return campaignPath(homepageBeatsCampaign.slug);
  }
  if (booking.kind === "hub-takeover" && booking.hubId === "yard-sale") {
    return campaignPath(yardSaleTuesdayCampaign.slug);
  }
  return undefined;
}

export function resolveCampaignLander(
  slug: string,
  bookings: readonly AdBooking[],
): CampaignLander | null {
  const trimmed = slug.trim();

  if (trimmed === homepageBeatsCampaign.slug) {
    const fixture = homepageFixture();
    if (!fixture) {
      return null;
    }
    const booking = latestHomepageTakeover(bookings);
    if (!booking) {
      return fixtureLander(homepageBeatsCampaign.slug, fixture);
    }
    return {
      slug: homepageBeatsCampaign.slug,
      stallName: booking.stallName,
      fromBooking: true,
      booking,
      slot: slotFromHomepageBooking(booking, fixture),
    };
  }

  if (trimmed === yardSaleTuesdayCampaign.slug) {
    const fixture = yardSaleFixture();
    if (!fixture) {
      return null;
    }
    const booking = latestYardSaleHubTakeover(bookings);
    if (!booking) {
      return fixtureLander(yardSaleTuesdayCampaign.slug, fixture);
    }
    return {
      slug: yardSaleTuesdayCampaign.slug,
      stallName: booking.stallName,
      fromBooking: true,
      booking,
      slot: slotFromYardSaleBooking(booking, fixture),
    };
  }

  return null;
}
