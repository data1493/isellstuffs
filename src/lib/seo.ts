import type { Metadata } from "next";

import {
  formatMoney,
  hubById,
  hubFloorList,
  isCartEligible,
  isGiftListing,
  isPhysicalListing,
  listingsByHub,
  listingsByStall,
  mallHubs,
  stallById,
  type Listing,
  type Stall,
} from "@/lib/commerce";
import {
  exploreHref,
  exploreStackBits,
  type ExploreAvail,
  type ExploreMax,
  type ExploreSort,
} from "@/lib/browse";
import { listingFact, listingFactLabel, listingStatusLabel } from "@/lib/listing-display";
import {
  aboutPath,
  collectionPath,
  collectionsPath,
  helpPath,
  listingPath,
  lotPath,
  orderPath,
  ordersPath,
  savedPath,
  searchPath,
  watchedPath,
  walkPath,
  wantedPath,
  agentsPath,
  agentSlipPath,
  agentTalkPath,
  donatePath,
  sellDeskPath,
  sellDeskStallPath,
  stallPath,
  thisWeekPath,
} from "@/lib/paths";
import { site } from "@/lib/site";

const fallbackOrigin = "http://127.0.0.1:44721";

export function siteOrigin() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  return raw && raw.length > 0 ? raw : fallbackOrigin;
}

export function absoluteUrl(path: string) {
  return new URL(path, `${siteOrigin()}/`).toString();
}

const indexFollow: Metadata["robots"] = {
  index: true,
  follow: true,
};

const noIndexFollow: Metadata["robots"] = {
  index: false,
  follow: true,
};

const noIndex: Metadata["robots"] = {
  index: false,
  follow: false,
};

type ShareInput = {
  title: string;
  description: string;
  path: string;
  robots?: Metadata["robots"];
  /** Use the title as-is — do not apply the `%s — i sell stuffs` template. */
  absoluteTitle?: boolean;
};

export function shareMetadata({
  title,
  description,
  path,
  robots = indexFollow,
  absoluteTitle = false,
}: ShareInput): Metadata {
  const url = absoluteUrl(path);
  const branded = `${title} — ${site.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots,
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: site.name,
      title: absoluteTitle ? title : branded,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle ? title : branded,
      description,
    },
  };
}

export function rootMetadata(): Metadata {
  return {
    metadataBase: new URL(siteOrigin()),
    applicationName: site.name,
    title: {
      default: `${site.name} — ${site.mall}`,
      template: `%s — ${site.name}`,
    },
    description: site.description,
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: site.name,
      title: `${site.name} — ${site.mall}`,
      description: site.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name} — ${site.mall}`,
      description: site.description,
    },
    robots: indexFollow,
  };
}

export function homeMetadata(): Metadata {
  return shareMetadata({
    title: `${site.name} — ${site.mall}`,
    description: site.description,
    path: "/",
    absoluteTitle: true,
  });
}

export function exploreMetadata(filters: {
  hubId?: string;
  type?: string;
  avail?: ExploreAvail;
  max?: ExploreMax;
  sort?: ExploreSort;
  unknown?: boolean;
}): Metadata {
  if (filters.unknown) {
    return shareMetadata({
      title: "That filter is not on the map",
      description:
        `Hubs are ${hubFloorList()}. Kind is physical or digital. On the floor is all or still here. Price is under a ten or under $25.`,
      path: "/explore",
      robots: noIndexFollow,
    });
  }

  const hub = mallHubs.find((item) => item.id === filters.hubId);
  const type = filters.type === "physical" || filters.type === "digital"
    ? filters.type
    : undefined;
  const avail = filters.avail === "open" ? "open" : undefined;
  const max = filters.max === "10" || filters.max === "25" ? filters.max : undefined;
  const sort =
    filters.sort === "price" || filters.sort === "price-desc"
      ? filters.sort
      : undefined;
  const path = exploreHref({ hubId: hub?.id, type, avail, max, sort });
  const extras = exploreStackBits({ type: undefined, avail, max, sort });
  const extraTitle = extras.length > 0 ? ` · ${extras.join(" · ")}` : "";
  const extraDescription =
    extras.length > 0 ? ` Filtered to ${extras.join(", ")}.` : "";

  if (hub && type === "physical") {
    return shareMetadata({
      title: `${hub.name} · physical${extraTitle}`,
      description: `${hub.blurb} Things you can hold in this aisle — condition first, no lookbook.${extraDescription}`,
      path,
    });
  }

  if (hub && type === "digital") {
    return shareMetadata({
      title: `${hub.name} · digital${extraTitle}`,
      description:
        (hub.id === "download-stall"
          ? `${hub.blurb} Files from the same stalls as the junk. Format stands in for condition.`
          : `${hub.name} does not keep a separate file shop. Digital listings live in Download Stall.`) +
        extraDescription,
      path,
    });
  }

  if (hub) {
    const count = listingsByHub(hub.id).length;
    return shareMetadata({
      title: `${hub.name} on the concourse${extraTitle}`,
      description: `${hub.blurb} ${count} ${count === 1 ? "listing" : "listings"} in ${hub.name}, including sold and file-gone. ${hub.rule}${extraDescription}`,
      path,
    });
  }

  if (type === "physical") {
    return shareMetadata({
      title: `Physical finds on the concourse${extraTitle}`,
      description:
        "Objects on the tables across every stall. Condition is the listing. Sold stays on the floor so you can see what walked." +
        extraDescription,
      path,
    });
  }

  if (type === "digital") {
    return shareMetadata({
      title: `Digital files on the concourse${extraTitle}`,
      description:
        "PDFs, beats, presets, and packs from the same stalls as the junk. Not a second storefront." +
        extraDescription,
      path,
    });
  }

  if (extras.length > 0) {
    const headline =
      extras[0] === "still here"
        ? "Still here on the concourse"
        : extras[0] === "under a ten"
          ? "Under a ten on the concourse"
          : extras[0] === "under $25"
            ? "Under $25 on the concourse"
            : "Explore the concourse";
    return shareMetadata({
      title: extras.length > 1 ? `${headline} · ${extras.slice(1).join(" · ")}` : headline,
      description:
        "The general mall floor. Filter the stand-in catalog by hub, physical or digital, still here, or a price band. Paid corners are labeled." +
        extraDescription,
      path,
    });
  }

  return shareMetadata({
    title: "Explore the concourse",
    description:
      "The general mall floor. Filter the stand-in catalog by hub, physical or digital, still here, or a price band. Paid corners are labeled.",
    path: "/explore",
  });
}

export function searchMetadata(query?: string): Metadata {
  const q = query?.trim().replace(/\s+/g, " ") ?? "";

  if (!q) {
    return shareMetadata({
      title: "Search the tables",
      description:
        "Look up a listing title, a stall, a hub, or physical versus digital. Same stand-in catalog as the concourse.",
      path: searchPath(),
    });
  }

  return shareMetadata({
    title: `Search · ${q}`,
    description: `Stand-in SKUs that match “${q}” by title, stall, hub, or physical/digital.`,
    path: searchPath(q),
    robots: noIndexFollow,
  });
}

export function browseMetadata(): Metadata {
  return shareMetadata({
    title: "Browse the concourse",
    description:
      "Browse redirects to the general concourse. Same floor as Explore — hubs, physical finds, and digital files.",
    path: "/explore",
  });
}

export function hubsIndexMetadata(): Metadata {
  return shareMetadata({
    title: "The aisles",
    description:
      `${hubFloorList()}. Each hub refuses the wrong inventory. Explore stays the general concourse.`,
    path: "/hubs",
  });
}

export function hubMetadata(hub: (typeof mallHubs)[number]): Metadata {
  const count = listingsByHub(hub.id).length;
  return shareMetadata({
    title: hub.name,
    description: `${hub.blurb} ${hub.rule} ${count} ${count === 1 ? "listing" : "listings"} in this aisle.`,
    path: hub.href,
  });
}

export function missingHubMetadata(): Metadata {
  return shareMetadata({
    title: "Aisle not on the map",
    description:
      `No artisan-home wing. No junk drawer. The floors are ${hubFloorList()}.`,
    path: "/hubs",
    robots: noIndexFollow,
  });
}

export function listingMetadata(listing: Listing): Metadata {
  const stall = stallById(listing.stallId);
  const hub = hubById(listing.hubId);
  const price = formatMoney(listing.price);
  const fact = listingFact(listing);
  const factLabel = listingFactLabel(listing);
  const status = listingStatusLabel(listing);

  const title = `${listing.title} · ${price}`;
  const description = [
    listing.summary,
    `${factLabel}: ${fact}.`,
    stall ? `From ${stall.boothName}.` : null,
    `${hub.name}.`,
    listing.status === "sold"
      ? "Sold — not in the tote."
      : listing.status === "file-gone"
        ? "The file is gone."
        : `${price}. ${status}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return shareMetadata({
    title,
    description,
    path: listingPath(listing.id),
  });
}

export function missingListingMetadata(): Metadata {
  return shareMetadata({
    title: "Listing gone",
    description:
      "No SKU with that id. It sold, the id is wrong, or it never made it onto the table.",
    path: "/explore",
    robots: noIndexFollow,
  });
}

export function stallMetadata(stall: Stall): Metadata {
  const inventory = listingsByStall(stall.id);
  const physical = inventory.filter(isPhysicalListing).length;
  const digital = inventory.length - physical;
  const mix = `${physical} ${physical === 1 ? "object" : "objects"} and ${digital} ${digital === 1 ? "file" : "files"}`;

  return shareMetadata({
    title: stall.boothName,
    description: `${stall.blurb} ${mix} from the same independent stall.${stall.featured ? " Paid the good corner — labeled." : ""}`,
    path: stallPath(stall.slug),
  });
}

export function missingStallMetadata(): Metadata {
  return shareMetadata({
    title: "Stall packed up",
    description:
      "No booth with that slug. The folding table is gone, or the name is wrong.",
    path: "/explore",
    robots: noIndexFollow,
  });
}

export function cartMetadata(): Metadata {
  return shareMetadata({
    title: "Your tote",
    description:
      "The bag for i sell stuffs. One mall charge for every stall in the tote. The mall keeps 10%. Test checkout only.",
    path: "/cart",
    robots: noIndex,
  });
}

export function savedMetadata(): Metadata {
  return shareMetadata({
    title: "Later pile",
    description:
      "Listings parked on this browser. Not the tote. Parked, not paid. No account.",
    path: savedPath(),
    robots: noIndex,
  });
}

export function watchedMetadata(): Metadata {
  return shareMetadata({
    title: "Watched tables",
    description:
      "Booths marked on this browser. Same folding tables next weekend. Not the later pile. No account.",
    path: watchedPath(),
    robots: noIndex,
  });
}

export function walkMetadata(): Metadata {
  return shareMetadata({
    title: "Saturday morning walk",
    description:
      "The scrap for this Saturday. Watched tables that are still out, with this weekend's hours. Packed booths stay in the car.",
    path: walkPath(),
    robots: noIndex,
  });
}

export function wantedMetadata(): Metadata {
  return shareMetadata({
    title: "Hunt board",
    description:
      "Tape what you are looking for. A scrap on the cork in this browser. Not a listing. Not the later pile. Not a watched table.",
    path: wantedPath(),
    robots: noIndex,
  });
}

export function agentRowMetadata(): Metadata {
  return shareMetadata({
    title: "Agent Row",
    description:
      "Named passes on one row. List a digital lot, take on paper, rate the aisle. The mall keeps 10% of a confirmed agent trade. Cookie default; DATABASE_URL shares walkers.",
    path: agentsPath(),
    robots: noIndex,
  });
}

export function agentSlipMetadata(tradeId: string): Metadata {
  return shareMetadata({
    title: "Agent slip",
    description:
      "Paper take. Ask, 10% mall cut, and net to seller. Confirm is the second POST. Cookie default when DATABASE_URL is unset.",
    path: agentSlipPath(tradeId),
    robots: noIndex,
  });
}

export function agentTalkMetadata(): Metadata {
  return shareMetadata({
    title: "Agent talk",
    description:
      "Leave a suggestion. Rate another named pass 1–35 stars. Cookie default when DATABASE_URL is unset. Not the hunt board.",
    path: agentTalkPath(),
    robots: noIndex,
  });
}

export function donateMetadata(): Metadata {
  return shareMetadata({
    title: "The jar",
    description:
      "Copy public receive addresses (SOL, ETH, XRP memo required, BTC, USDT ERC-20, DOGE) or pledge on paper (Venmo, PayPal, Zelle, Stripe). 100% jar — no mall cut. Not a tote coupon.",
    path: donatePath(),
    robots: noIndex,
  });
}

export function aboutMetadata(): Metadata {
  return shareMetadata({
    title: "The mall story",
    description:
      `${site.name} is a flea-market mall. Independent stalls sell physical finds and digital files from the same table. The mall keeps 10%. Paid corners are labeled. Not a warehouse.`,
    path: aboutPath(),
  });
}

export function helpMetadata(): Metadata {
  return shareMetadata({
    title: "How this mall works",
    description:
      `Browse the floor, bag a tote, mock-pay, open a folder slip, or list a stall. The mall keeps 10% from the stall. Not the origin story or the fee board.`,
    path: helpPath(),
  });
}

export function ordersMetadata(): Metadata {
  return shareMetadata({
    title: "Order slips",
    description:
      "Stand-in receipts from the last paid tote in this browser. Reconstructed from checkout listing ids. No account. No database.",
    path: ordersPath(),
    robots: noIndex,
  });
}

export function orderSlipMetadata(id: string): Metadata {
  return shareMetadata({
    title: "Order slip",
    description:
      "Stand-in receipt reconstructed from the listing ids on a paid tote. Not a warehouse invoice.",
    path: orderPath(id),
    robots: noIndex,
  });
}

export function sellDeskMetadata(): Metadata {
  return shareMetadata({
    title: "Your table tonight",
    description:
      "The stallholder home for Folding Table Tuesday. List something, check paper payouts, read the cut, or rewrite the booth card. No account.",
    path: sellDeskPath(),
  });
}

export function sellDeskStallMetadata(stall: Stall): Metadata {
  return shareMetadata({
    title: `Your table tonight · ${stall.boothName}`,
    description: `The stallholder desk for ${stall.boothName}. Same tools as Tuesday — list, paper payouts, the cut, rewrite the booth card. No account.`,
    path: sellDeskStallPath(stall.slug),
  });
}

export function missingSellDeskStallMetadata(): Metadata {
  return shareMetadata({
    title: "That stall packed up",
    description:
      "No desk for that slug. Pick a booth the mall already has, or walk back to the Tuesday door.",
    path: sellDeskPath(),
    robots: noIndexFollow,
  });
}

export function thisWeekMetadata(): Metadata {
  return shareMetadata({
    title: "This week on the table",
    description:
      "A weekend stall drop. Mall picks from the stand-in catalog — objects and files, not paid stamps.",
    path: thisWeekPath(),
  });
}

export function lotMetadata(): Metadata {
  return shareMetadata({
    title: "Who set up",
    description:
      "The lot map. Which folding tables came this weekend, which went in the car. Not a lookbook. Not this week's picks.",
    path: lotPath(),
  });
}

export function collectionsMetadata(): Metadata {
  return shareMetadata({
    title: "Racks, not aisles",
    description:
      "Curated collections from the stand-in catalog. Under a ten, files tonight, and tested kinda — themes a stallholder taped, not a fifth hub.",
    path: collectionsPath(),
  });
}

export function collectionMetadata(input: {
  name: string;
  description: string;
  slug: string;
}): Metadata {
  return shareMetadata({
    title: input.name,
    description: input.description,
    path: collectionPath(input.slug),
  });
}

export function missingCollectionMetadata(): Metadata {
  return shareMetadata({
    title: "Rack not on the map",
    description:
      "That collection was never taped. Under a ten, files tonight, and tested kinda are the racks we lined up.",
    path: collectionsPath(),
    robots: noIndexFollow,
  });
}

export function checkoutMockMetadata(): Metadata {
  return shareMetadata({
    title: "Pay the mall",
    description:
      "Test checkout for your tote. One charge, then each stall is owed its cut. No live payouts.",
    path: "/checkout/mock",
    robots: noIndex,
  });
}

export function checkoutSuccessMetadata(): Metadata {
  return shareMetadata({
    title: "You’re on the slip",
    description:
      "Test payment landed. The tote is empty. Stalls are owed their cut on paper. Nothing live moved.",
    path: "/checkout/success",
    robots: noIndex,
  });
}

export function checkoutCancelMetadata(): Metadata {
  return shareMetadata({
    title: "Checkout canceled",
    description:
      "Nothing was charged. Your tote still holds whatever you picked up.",
    path: "/checkout/cancel",
    robots: noIndex,
  });
}

export function notFoundMetadata(): Metadata {
  return shareMetadata({
    title: "Not on the map",
    description:
      "That path is not an aisle in this mall. Walk the concourse or pick a hub with a rule.",
    path: "/",
    robots: noIndexFollow,
  });
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    alternateName: site.mall,
    description: site.description,
    url: absoluteUrl("/"),
  };
}

export function listingProductJsonLd(listing: Listing) {
  const stall = stallById(listing.stallId);
  const hub = hubById(listing.hubId);
  const url = absoluteUrl(listingPath(listing.id));
  const price = (listing.price.amountCents / 100).toFixed(2);
  const availability = offerAvailability(listing);
  const fact = listingFact(listing);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.summary,
    sku: listing.id,
    url,
    category: hub.name,
    additionalType: isGiftListing(listing)
      ? "https://schema.org/GiftCard"
      : isPhysicalListing(listing)
        ? "https://schema.org/Product"
        : "https://schema.org/DigitalDocument",
    itemCondition: isPhysicalListing(listing)
      ? "https://schema.org/UsedCondition"
      : undefined,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: isPhysicalListing(listing)
          ? "condition"
          : isGiftListing(listing)
            ? "giftCode"
            : "fileFormat",
        value: fact,
      },
      {
        "@type": "PropertyValue",
        name: "listingType",
        value: listing.type,
      },
      {
        "@type": "PropertyValue",
        name: "status",
        value: listing.status,
      },
    ],
    brand: {
      "@type": "Brand",
      name: stall?.boothName ?? site.name,
    },
    seller: stall
      ? {
          "@type": "Organization",
          name: stall.boothName,
          url: absoluteUrl(stallPath(stall.slug)),
        }
      : {
          "@type": "Organization",
          name: site.name,
          url: absoluteUrl("/"),
        },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: listing.price.currency.toUpperCase(),
      price,
      availability,
      itemCondition: isPhysicalListing(listing)
        ? "https://schema.org/UsedCondition"
        : undefined,
      seller: stall
        ? {
            "@type": "Organization",
            name: stall.boothName,
            url: absoluteUrl(stallPath(stall.slug)),
          }
        : undefined,
    },
  };
}

function offerAvailability(listing: Listing) {
  if (listing.status === "sold" || listing.status === "file-gone") {
    return "https://schema.org/SoldOut";
  }
  if (isCartEligible(listing)) {
    return "https://schema.org/InStock";
  }
  return "https://schema.org/OutOfStock";
}

