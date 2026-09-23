import {
  isDigitalListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";
import { liveListings } from "@/lib/live-catalog";
import { collectionPath } from "@/lib/paths";
import { isTestedKindaPinned } from "@/lib/tested-kinda-pin";

/** Pocket-money ceiling. $10.00 is not under a ten. Game Boy is $28. */
export const UNDER_TEN_CENTS = 1000;

export const collectionSlugs = [
  "under-10",
  "files-tonight",
  "tested-kinda",
] as const;

export type CollectionSlug = (typeof collectionSlugs)[number];

/**
 * Hand-racked “tested, kinda” pile. Not a hub id.
 * New Media Bin / Kitchen Drawer SKUs sit next to the Game Boy.
 */
export const testedKindaIds = [
  "gtk-game-boy",
  "gtk-cable-drawer",
  "ysk-wobbly-lamp",
  "mdb-scratched-lp",
  "kdr-lid-no-pot",
  "dl-camera-luts",
] as const;

export type Collection = {
  slug: CollectionSlug;
  name: string;
  eyebrow: string;
  headline: string;
  blurb: string;
  rule: string;
  href: string;
};

export const mallCollections = [
  {
    slug: "under-10",
    name: "Under a ten",
    eyebrow: "Pocket-money rack",
    headline: "If it is over a ten, it is not on this table.",
    blurb:
      "A stallholder taped a price ceiling. Change, leftover jewel cases, a bent whisk, files that cost less than lunch. The Game Boy stays in Garage Tech.",
    rule: "Available and under $10. Sold and file-gone do not sit here.",
    href: collectionPath("under-10"),
  },
  {
    slug: "files-tonight",
    name: "Files tonight",
    eyebrow: "Take-home folder",
    headline: "Files you can take tonight. Same stalls as the junk.",
    blurb:
      "No warehouse. These are the downloads still in a folder — PDFs, LUTs, a sample pack, a font, liner notes, stained recipes. The stain zine walked.",
    rule: "Available digital only. File-gone stays off the rack.",
    href: collectionPath("files-tonight"),
  },
  {
    slug: "tested-kinda",
    name: "Tested, kinda",
    eyebrow: "It did something",
    headline: "We turned it on. It did a thing.",
    blurb:
      "A rack for the ones that work if you squint. Game Boy with Tetris fused in. A lamp you twist. A record that skips. LUTs from a camera that only half-works.",
    rule: "Hand-picked SKUs that still do something. Not a hub.",
    href: collectionPath("tested-kinda"),
  },
] as const satisfies readonly Collection[];

const underTenNotes: Record<string, string> = {
  "gtk-cable-drawer":
    "A pile for six bucks. We are not testing each end.",
  "ysk-burned-cdr":
    "Jewel-case leftover. Under a ten because it is a leftover.",
  "mdb-scratched-lp":
    "Nine dollars for a skip. Side B is the honest one.",
  "mdb-mixtape-93":
    "Four dollars. No tracklist. Summer is in the hiss.",
  "mdb-jewel-stack":
    "Empty cases. Two-fifty. You bring the disc.",
  "kdr-chipped-mug":
    "Five dollars. The chip is where your mouth is not.",
  "kdr-lid-no-pot":
    "Three dollars for a lid. The pot left town.",
  "kdr-bent-whisk":
    "Two dollars. Still metal. Eggs do not mind.",
  "dl-junk-pricing-pdf":
    "Two dollars to price the rest of this rack.",
  "dl-camera-luts":
    "Nine dollars. Three looks from a camera that only half-works.",
  "dl-sample-pack":
    "Four dollars. Twelve shots. Not picky.",
  "dl-booth-font":
    "Seven dollars. Looks like the food-court map.",
  "dl-crate-side-a":
    "A dollar fifty for what we remember about the tape.",
  "dl-drawer-recipes":
    "Two dollars. Grease in the corner. Measurements are vibes.",
};

const filesTonightNotes: Record<string, string> = {
  "dl-junk-pricing-pdf":
    "One page. You can open it tonight.",
  "dl-camera-luts":
    "Three looks. Drop them on footage tonight.",
  "dl-sample-pack":
    "A zip. Twelve shots. Play it tonight.",
  "dl-booth-font":
    "Two weights. Install it tonight. Looks like a directory.",
  "dl-crate-side-a":
    "Liner notes for the mixtape. One page. Wrong on purpose.",
  "dl-drawer-recipes":
    "Three stained cards. Dinner is a vibe, not a recipe.",
};

const testedKindaNotes: Record<string, string> = {
  "gtk-game-boy":
    "We pressed start. Tetris went. The crack is part of the listing.",
  "gtk-cable-drawer":
    "Untested tangle. Some ends look honest. That is the test.",
  "ysk-wobbly-lamp":
    "Twist the neck. It lights. Shade optional, light required.",
  "mdb-scratched-lp":
    "Plays. Skips the chorus. We called that tested.",
  "kdr-lid-no-pot":
    "Knob wiggles. Lid is still a lid. Pot not invited.",
  "dl-camera-luts":
    "From a camera that only half-works. The looks still apply.",
};

const notesBySlug: Record<CollectionSlug, Record<string, string>> = {
  "under-10": underTenNotes,
  "files-tonight": filesTonightNotes,
  "tested-kinda": testedKindaNotes,
};

const fallbackNote: Record<CollectionSlug, string> = {
  "under-10": "Still under a ten. Take it if it fits your pocket.",
  "files-tonight": "A file you can take tonight. Same table as the junk.",
  "tested-kinda": "We turned it on. It did something.",
};

export type RackItem = {
  listing: Listing;
  note: string;
};

export function isCollectionSlug(value: string): value is CollectionSlug {
  return (collectionSlugs as readonly string[]).includes(value);
}

export function collectionBySlug(slug: string): Collection | undefined {
  return mallCollections.find((collection) => collection.slug === slug);
}

function stillOnTheRack(listing: Listing): boolean {
  return listing.status === "available" && listing.cartEligible;
}

export function listingFitsCollection(
  listing: Listing,
  slug: CollectionSlug,
): boolean {
  if (!stillOnTheRack(listing)) return false;

  if (slug === "under-10") {
    return listing.price.amountCents < UNDER_TEN_CENTS;
  }

  if (slug === "files-tonight") {
    return isDigitalListing(listing);
  }

  return (
    (testedKindaIds as readonly string[]).includes(listing.id) ||
    isTestedKindaPinned(listing.id)
  );
}

export function rackNote(listing: Listing, slug: CollectionSlug): string {
  return notesBySlug[slug][listing.id] ?? fallbackNote[slug];
}

export function collectionRack(slug: CollectionSlug): RackItem[] {
  const items = liveListings()
    .filter((listing) => listingFitsCollection(listing, slug))
    .map((listing) => ({ listing, note: rackNote(listing, slug) }));

  if (slug === "under-10") {
    return [...items].sort(
      (left, right) => left.listing.price.amountCents - right.listing.price.amountCents,
    );
  }

  if (slug === "tested-kinda") {
    const order = new Map<string, number>(
      testedKindaIds.map((id, index) => [id, index]),
    );
    return [...items].sort(
      (left, right) =>
        (order.get(left.listing.id) ?? 99) - (order.get(right.listing.id) ?? 99),
    );
  }

  return items;
}

export function collectionMix(items: RackItem[]) {
  let physical = 0;
  let digital = 0;
  for (const item of items) {
    if (isPhysicalListing(item.listing)) physical += 1;
    if (isDigitalListing(item.listing)) digital += 1;
  }
  return { physical, digital };
}

export function collectionShareLine(collection: Collection, items: RackItem[]) {
  if (items.length === 0) {
    return `${collection.name} is empty. Walk the concourse.`;
  }

  const titles = items
    .slice(0, 4)
    .map((item) => item.listing.title)
    .join("; ");
  return `${collection.blurb} On the rack: ${titles}.`;
}

export function otherCollections(slug: CollectionSlug) {
  return mallCollections.filter((collection) => collection.slug !== slug);
}
