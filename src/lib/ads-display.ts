import { hubById, stallById, type AdSlot, type AdSlotKind } from "@/lib/commerce";
import { campaignPath, stallPath } from "@/lib/paths";

/**
 * Presentation for mall advertising. Not a commerce shape —
 * slots still come from `@/lib/commerce`.
 */

/** Bought campaign URLs — souvenirs, not rows on the concourse. */
export const homepageBeatsCampaign = {
  slotId: "slot-homepage-beats",
  slug: "homepage-beats",
} as const;

export const yardSaleTuesdayCampaign = {
  slotId: "slot-hub-yard-sale",
  slug: "yard-sale-tuesday",
} as const;

export const soldCampaigns = [
  homepageBeatsCampaign,
  yardSaleTuesdayCampaign,
] as const;

export const campaignLanderPath = campaignPath(homepageBeatsCampaign.slug);
export const yardSaleTuesdayLanderPath = campaignPath(
  yardSaleTuesdayCampaign.slug,
);

export function landerForSlot(slot: AdSlot): string | undefined {
  const campaign = soldCampaigns.find((item) => item.slotId === slot.id);
  return campaign ? campaignPath(campaign.slug) : undefined;
}

export const adKindCopy: Record<
  AdSlotKind,
  { product: string; includes: string; cannotBuy: string }
> = {
  "featured-stall": {
    product: "Featured stall",
    includes:
      "The good corner on home and on unfiltered explore. The stall page wears the same paid stamp.",
    cannotBuy: "You do not jump the queue on filtered explore. You do not hide the label.",
  },
  "homepage-takeover": {
    product: "Homepage takeover",
    includes:
      "The concourse hero until Monday, plus a campaign URL that exists only because you paid.",
    cannotBuy: "You do not replace the mall pitch. You do not look organic.",
  },
  "hub-takeover": {
    product: "Hub takeover",
    includes:
      "The aisle hero for one hub, plus a campaign URL that exists only because you paid. The floor still has a rule.",
    cannotBuy: "You do not rewrite what the aisle refuses. Yard Sale stays a driveway.",
  },
};

export type LiveSurface = {
  href: string;
  label: string;
  note: string;
};

export function liveSurfaces(slot: AdSlot): LiveSurface[] {
  const stall = stallById(slot.stallId);
  const surfaces: LiveSurface[] = [];

  if (slot.kind === "homepage-takeover") {
    surfaces.push({
      href: "/",
      label: "Home concourse hero",
      note: "Dark paid band under the mall pitch",
    });
  }

  if (slot.kind === "featured-stall") {
    surfaces.push({
      href: "/",
      label: "Home — the good corner",
      note: "Labeled featured booth after the hubs",
    });
    surfaces.push({
      href: "/explore",
      label: "Unfiltered explore",
      note: "Same booth when no hub or type filter is on",
    });
    if (stall) {
      surfaces.push({
        href: stallPath(stall.slug),
        label: stall.boothName,
        note: "Stall page wears the paid-corner stamp",
      });
    }
  }

  if (slot.kind === "hub-takeover" && slot.hubId) {
    const hub = hubById(slot.hubId);
    surfaces.push({
      href: hub.href,
      label: `${hub.name} aisle`,
      note: "Hub hero, stamped Paid",
    });
  }

  const lander = landerForSlot(slot);
  if (lander) {
    surfaces.push({
      href: lander,
      label: "Campaign lander",
      note:
        slot.kind === "hub-takeover"
          ? "The URL they bought with the aisle"
          : "The URL they bought with the takeover",
    });
  }

  return surfaces;
}

export function isHomepageBeatsCampaign(slot: AdSlot): boolean {
  return slot.id === homepageBeatsCampaign.slotId;
}

export function isSoldCampaign(slot: AdSlot): boolean {
  return soldCampaigns.some((item) => item.slotId === slot.id);
}
