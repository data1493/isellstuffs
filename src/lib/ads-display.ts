import { hubById, stallById, type AdSlot, type AdSlotKind } from "@/lib/commerce";
import { campaignPath, stallPath } from "@/lib/paths";

/**
 * Presentation for mall advertising. Not a commerce shape —
 * slots still come from `@/lib/commerce`.
 */

/** The one campaign URL sold as a page, not a row on the concourse. */
export const homepageBeatsCampaign = {
  slotId: "slot-homepage-beats",
  slug: "homepage-beats",
} as const;

export const campaignLanderPath = campaignPath(homepageBeatsCampaign.slug);

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
    includes: "The aisle hero for one hub. The floor still has a rule.",
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
    if (slot.id === homepageBeatsCampaign.slotId) {
      surfaces.push({
        href: campaignLanderPath,
        label: "Campaign lander",
        note: "The URL they bought with the takeover",
      });
    }
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

  return surfaces;
}

export function isHomepageBeatsCampaign(slot: AdSlot): boolean {
  return slot.id === homepageBeatsCampaign.slotId;
}
