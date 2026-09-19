/**
 * Mall hubs. Homepage + /browse stay the general concourse;
 * each of these earns an aisle page with a refuse rule.
 */

export const mallHubs = [
  {
    id: "yard-sale",
    name: "Yard Sale",
    slug: "yard-sale",
    href: "/hubs/yard-sale",
    blurb: "Used household, leftover furniture-adjacent, “I don’t want this anymore.”",
    rule: "If it could sit on a folding table in a driveway, it belongs. No “artisan home.”",
  },
  {
    id: "closet-overflow",
    name: "Closet Overflow",
    slug: "closet-overflow",
    href: "/hubs/closet-overflow",
    blurb: "Clothes, shoes, bags that are not a boutique.",
    rule: "Fit, stains, and “worn twice” beat lookbooks.",
  },
  {
    id: "garage-tech",
    name: "Garage Tech",
    slug: "garage-tech",
    href: "/hubs/garage-tech",
    blurb: "Phones, cables, cameras, half-working gadgets.",
    rule: "Condition is a first-class field. “Tested, kinda” is valid copy.",
  },
  {
    id: "media-bin",
    name: "Media Bin",
    slug: "media-bin",
    href: "/hubs/media-bin",
    blurb: "Vinyl, tapes, jewel cases, magazines that still have a spine.",
    rule: "If it spins, rewinds, or snaps shut, it belongs. No streaming codes.",
  },
  {
    id: "kitchen-drawer",
    name: "Kitchen Drawer",
    slug: "kitchen-drawer",
    href: "/hubs/kitchen-drawer",
    blurb: "Mismatched mugs, dented lids, utensils that survived three apartments.",
    rule: "If it lived next to the sink, it belongs. No staged tableware sets.",
  },
  {
    id: "download-stall",
    name: "Download Stall",
    slug: "download-stall",
    href: "/hubs/download-stall",
    blurb: "PDFs, beats, presets, zines, fonts, packs, and mall gift cards.",
    rule: "Digital is a listing type, not a separate site. Same stall as the junk.",
  },
] as const;

export type HubId = (typeof mallHubs)[number]["id"];

export function hubById(id: HubId) {
  const hub = mallHubs.find((item) => item.id === id);
  if (!hub) {
    throw new Error(`Unknown hub: ${id}`);
  }
  return hub;
}

/** Physical aisles only. Digital listings stay in Download Stall. */
export function physicalHubs() {
  return mallHubs.filter((hub) => hub.id !== "download-stall");
}

/** “Yard Sale, Closet Overflow, and Download Stall” for map copy. */
export function hubFloorList() {
  const names = mallHubs.map((hub) => hub.name);
  if (names.length <= 1) {
    return names[0] ?? "";
  }
  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}
