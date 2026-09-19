import { stampFileGoneListings } from "../file-gone-overlay";
import { stampHandsListings } from "../in-hands";
import { stampLookListings } from "../look-overlay";
import { stampPackedListings } from "../packed-stall";
import { readSellerListings } from "../seller-overlay";
import { stampSoldListings } from "../sold-overlay";
import { applyStallCard } from "../stall-overlay";
import { money } from "./money";
import type { AdSlot, DigitalListing, Listing, PhysicalListing, Stall } from "./types";

/** Light stand-in stalls. Seller identity is a static record, not an account. */
export const stalls = [
  {
    id: "folding-table-tuesday",
    slug: "folding-table-tuesday",
    boothName: "Folding Table Tuesday",
    featured: false,
    blurb: "Whatever did not sell in the driveway last weekend. Cash-or-cart energy.",
  },
  {
    id: "the-hall-closet",
    slug: "the-hall-closet",
    boothName: "The Hall Closet",
    featured: false,
    blurb: "Clothes that had a season. Bags that had a job. Nothing with a lookbook.",
  },
  {
    id: "half-working",
    slug: "half-working",
    boothName: "Half-Working Electronics",
    featured: true,
    blurb: "Gadgets that turn on. Sometimes. Tested, kinda. Paid for the good corner.",
  },
  {
    id: "beats-under-the-table",
    slug: "beats-under-the-table",
    boothName: "Beats Under the Table",
    featured: false,
    blurb: "Files in a folder and one burned disc that still lives in a jewel case.",
  },
  {
    id: "sunday-crate",
    slug: "sunday-crate",
    boothName: "Sunday Crate",
    featured: false,
    blurb: "Records, tapes, and jewel cases that survived the car. Side A still plays.",
  },
  {
    id: "the-sink-drawer",
    slug: "the-sink-drawer",
    boothName: "The Sink Drawer",
    featured: false,
    blurb: "Utensils and mugs from three apartments. Nothing matches. Everything still works.",
  },
  {
    id: "gift-desk",
    slug: "gift-desk",
    boothName: "Gift Desk",
    featured: false,
    blurb: "Mall credit from a desk, not a folder of PDFs. One card. After checkout you get a stand-in code — no Stripe gift API.",
  },
] as const satisfies readonly Stall[];

const physicalListings = [
  {
    id: "ysk-wobbly-lamp",
    stallId: "folding-table-tuesday",
    type: "physical",
    title: "Wobbly ceramic lamp, shade optional",
    summary: "Lights up if you twist the neck. Shade is in the box. Box is tired.",
    hubId: "yard-sale",
    price: money(1200),
    condition: "Has a crack, still lights up",
    cartEligible: true,
    status: "available",
  },
  {
    id: "ysk-folding-chair",
    stallId: "folding-table-tuesday",
    type: "physical",
    title: "Metal folding chair with a mystery stain",
    summary: "Sat in a driveway. Folds. The stain is brown and we are not detectives.",
    hubId: "yard-sale",
    price: money(800),
    condition: "Used, sticky in July weather",
    cartEligible: false,
    status: "sold",
  },
  {
    id: "clo-windbreaker",
    stallId: "the-hall-closet",
    type: "physical",
    title: "Mint-green windbreaker, worn twice",
    summary: "Pit stains pending. Size M if you are honest, L if you are hopeful.",
    hubId: "closet-overflow",
    price: money(1800),
    condition: "Worn twice, smells like a car",
    cartEligible: true,
    status: "available",
  },
  {
    id: "clo-split-soles",
    stallId: "the-hall-closet",
    type: "physical",
    title: "Split-sole sneakers, still a pair",
    summary: "Left toe is peeling. Right toe is considering it. Both still walk.",
    hubId: "closet-overflow",
    price: money(1400),
    condition: "Worn hard, laces original",
    cartEligible: true,
    status: "available",
  },
  {
    id: "gtk-game-boy",
    stallId: "half-working",
    type: "physical",
    title: "Cracked Game Boy, Tetris still in it",
    summary: "Screen has a line. Cartridge is fused in. We pressed start. It went.",
    hubId: "garage-tech",
    price: money(2800),
    condition: "Tested, kinda",
    cartEligible: true,
    status: "available",
  },
  {
    id: "gtk-cable-drawer",
    stallId: "half-working",
    type: "physical",
    title: "Drawer of mystery cables, sold as a pile",
    summary: "USB that might be USB. A charger for a phone we do not remember.",
    hubId: "garage-tech",
    price: money(600),
    condition: "Untested tangle, some ends look honest",
    cartEligible: true,
    status: "available",
  },
  {
    id: "ysk-burned-cdr",
    stallId: "beats-under-the-table",
    type: "physical",
    title: "Jewel-case CD-R labeled BEATS 07 in Sharpie",
    summary: "Physical leftover from a folder that now lives as a zip. Scratched, plays.",
    hubId: "yard-sale",
    price: money(300),
    condition: "Scratched, still spins",
    cartEligible: true,
    status: "available",
  },
  {
    id: "mdb-scratched-lp",
    stallId: "sunday-crate",
    type: "physical",
    title: "Scratched copy of a record we will not name",
    summary: "Side A skips once. Side B is honest. Sleeve is a grocery bag now.",
    hubId: "media-bin",
    price: money(900),
    condition: "Plays, skips the chorus",
    cartEligible: true,
    status: "available",
  },
  {
    id: "mdb-mixtape-93",
    stallId: "sunday-crate",
    type: "physical",
    title: "Mixtape marked SUMMER 93 in fading ink",
    summary: "Cassette. No tracklist. The first song is a radio edit we all know.",
    hubId: "media-bin",
    price: money(400),
    condition: "Rewound by hand, hiss is part of it",
    cartEligible: true,
    status: "available",
  },
  {
    id: "mdb-jewel-stack",
    stallId: "sunday-crate",
    type: "physical",
    title: "Stack of empty jewel cases, one cracked",
    summary: "Five cases. One hinge gone. Sold as a pile because that is how they arrived.",
    hubId: "media-bin",
    price: money(250),
    condition: "Empty, one crack, still snap shut",
    cartEligible: true,
    status: "available",
  },
  {
    id: "kdr-chipped-mug",
    stallId: "the-sink-drawer",
    type: "physical",
    title: "Diner mug with a chip you can feel",
    summary: "Holds coffee. The chip is on the rim opposite the handle. We checked.",
    hubId: "kitchen-drawer",
    price: money(500),
    condition: "Chipped, still a mug",
    cartEligible: true,
    status: "available",
  },
  {
    id: "kdr-lid-no-pot",
    stallId: "the-sink-drawer",
    type: "physical",
    title: "Pot lid, pot not included",
    summary: "Glass lid. Knob is loose. Fits something we no longer have.",
    hubId: "kitchen-drawer",
    price: money(300),
    condition: "Lid only, knob wiggles",
    cartEligible: true,
    status: "available",
  },
  {
    id: "kdr-bent-whisk",
    stallId: "the-sink-drawer",
    type: "physical",
    title: "Balloon whisk that is no longer a balloon",
    summary: "Wires splay. Still beats eggs if you are not photographing them.",
    hubId: "kitchen-drawer",
    price: money(200),
    condition: "Bent, still metal",
    cartEligible: true,
    status: "available",
  },
] as const satisfies readonly PhysicalListing[];

const digitalListings = [
  {
    id: "dl-junk-pricing-pdf",
    stallId: "folding-table-tuesday",
    type: "digital",
    title: "How to price your junk (PDF)",
    summary: "One page. A rule of thumb. Written on a folding table.",
    hubId: "download-stall",
    price: money(200),
    fileFormat: "PDF",
    cartEligible: true,
    status: "available",
  },
  {
    id: "dl-stain-zine",
    stallId: "the-hall-closet",
    type: "digital",
    title: "Stain-first closet zine",
    summary: "How to list clothes without a lookbook. Six pages, ugly on purpose.",
    hubId: "download-stall",
    price: money(400),
    fileFormat: "PDF",
    cartEligible: false,
    status: "file-gone",
  },
  {
    id: "dl-camera-luts",
    stallId: "half-working",
    type: "digital",
    title: "Parking-lot LUT pack",
    summary: "Three looks from a camera that only half-works. Warm, worse, fluorescent.",
    hubId: "download-stall",
    price: money(900),
    fileFormat: "CUBE",
    cartEligible: true,
    status: "available",
  },
  {
    id: "dl-sample-pack",
    stallId: "beats-under-the-table",
    type: "digital",
    title: "$4 sample pack",
    summary: "Twelve one-shots and a loop that slaps if you are not picky.",
    hubId: "download-stall",
    price: money(400),
    fileFormat: "ZIP / WAV",
    cartEligible: true,
    status: "available",
  },
  {
    id: "dl-booth-font",
    stallId: "beats-under-the-table",
    type: "digital",
    title: "Mall-directory font, two weights",
    summary: "Looks like a food-court map. Regular and “almost bold.”",
    hubId: "download-stall",
    price: money(700),
    fileFormat: "OTF",
    cartEligible: true,
    status: "available",
  },
  {
    id: "dl-crate-side-a",
    stallId: "sunday-crate",
    type: "digital",
    title: "Side A liner notes (PDF)",
    summary: "What we remember about the mixtape. One page. Wrong on purpose.",
    hubId: "download-stall",
    price: money(150),
    fileFormat: "PDF",
    cartEligible: true,
    status: "available",
  },
  {
    id: "dl-drawer-recipes",
    stallId: "the-sink-drawer",
    type: "digital",
    title: "Stained recipe cards, scanned",
    summary: "Three cards. Grease in the corner. Measurements are vibes.",
    hubId: "download-stall",
    price: money(200),
    fileFormat: "PDF",
    cartEligible: true,
    status: "available",
  },
  {
    id: "dl-mall-gift-card",
    stallId: "gift-desk",
    type: "digital",
    title: "$25 mall gift card",
    summary:
      "Credit for this floor. Not a PDF. Not a payment-provider gift. After checkout you get a stand-in code the desk can read on paper.",
    hubId: "download-stall",
    price: money(2500),
    fileFormat: "Gift code",
    cartEligible: true,
    status: "available",
  },
] as const satisfies readonly DigitalListing[];

/** Stand-in SKUs. Swap later without rewriting the contract. */
export const listings: Listing[] = [...physicalListings, ...digitalListings];

/** Fixture rows plus the local seller overlay. Shop lookups use this. */
export function allListings(): Listing[] {
  const overlay = readSellerListings();
  const seen = new Set(listings.map((listing) => listing.id));
  const extra = overlay.filter((listing) => !seen.has(listing.id));
  const merged = extra.length === 0 ? listings : [...listings, ...extra];
  return stampHandsListings(
    stampLookListings(
      stampPackedListings(stampFileGoneListings(stampSoldListings(merged))),
    ),
  );
}

export const adSlots = [
  {
    id: "slot-featured-half-working",
    kind: "featured-stall",
    labeled: true,
    stallId: "half-working",
    headline: "Paid the good corner: Half-Working Electronics",
    blurb: "Featured booth on the mall floor. Gadgets that turn on. Sometimes.",
    packageName: "Featured stall, weekend",
    price: money(2500),
    window: "This weekend",
  },
  {
    id: "slot-homepage-beats",
    kind: "homepage-takeover",
    labeled: true,
    stallId: "beats-under-the-table",
    headline: "Homepage takeover: Beats Under the Table",
    blurb: "One stall owns the concourse hero until Monday. Labeled. Not organic.",
    packageName: "Homepage takeover",
    price: money(4500),
    window: "Fri–Mon",
  },
  {
    id: "slot-hub-yard-sale",
    kind: "hub-takeover",
    labeled: true,
    stallId: "folding-table-tuesday",
    hubId: "yard-sale",
    headline: "Yard Sale this weekend is Folding Table Tuesday",
    blurb: "Hub hero for the driveway aisle. Paid corner, labeled as such.",
    packageName: "Hub takeover",
    price: money(1800),
    window: "This weekend",
  },
] as const satisfies readonly AdSlot[];

/** Fixture booths plus the local stall-card overlay. Shop lookups use this. */
export function allStalls(): Stall[] {
  return stalls.map((stall) => applyStallCard(stall));
}

export function stallById(id: string): Stall | undefined {
  return allStalls().find((stall) => stall.id === id);
}

export function stallBySlug(slug: string): Stall | undefined {
  return allStalls().find((stall) => stall.slug === slug);
}

export function listingById(id: string): Listing | undefined {
  return allListings().find((listing) => listing.id === id);
}

export function listingsByStall(stallId: string): Listing[] {
  return allListings().filter((listing) => listing.stallId === stallId);
}

export function listingsByHub(hubId: Listing["hubId"]): Listing[] {
  return allListings().filter((listing) => listing.hubId === hubId);
}

export function listingsByType(type: Listing["type"]): Listing[] {
  return allListings().filter((listing) => listing.type === type);
}

export function cartEligibleListings(): Listing[] {
  return allListings().filter(
    (listing) => listing.cartEligible && listing.status === "available",
  );
}

export function featuredStalls(): Stall[] {
  return allStalls().filter((stall) => stall.featured);
}

export function adSlotsByKind(kind: AdSlot["kind"]): AdSlot[] {
  return adSlots.filter((slot) => slot.kind === kind);
}

export function featuredStallSlots(): AdSlot[] {
  return adSlotsByKind("featured-stall");
}
