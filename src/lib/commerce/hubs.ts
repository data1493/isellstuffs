/**
 * Locked mall hubs from marketplace-concept.md.
 * Homepage + /browse stay the general concourse; these four earn aisle pages.
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
    id: "download-stall",
    name: "Download Stall",
    slug: "download-stall",
    href: "/hubs/download-stall",
    blurb: "PDFs, beats, presets, zines, fonts, packs.",
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
