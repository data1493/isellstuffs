import type { Metadata } from "next";

import {
  formatMoney,
  hubById,
  isCartEligible,
  isPhysicalListing,
  listingsByHub,
  listingsByStall,
  mallHubs,
  stallById,
  type Listing,
  type Stall,
} from "@/lib/commerce";
import { listingFact, listingStatusLabel } from "@/lib/listing-display";
import { listingPath, searchPath, stallPath } from "@/lib/paths";
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
  unknown?: boolean;
}): Metadata {
  if (filters.unknown) {
    return shareMetadata({
      title: "That filter is not on the map",
      description:
        "Hubs are Yard Sale, Closet Overflow, Garage Tech, and Download Stall. Kind is physical or digital. Clear the query and walk the concourse.",
      path: "/explore",
      robots: noIndexFollow,
    });
  }

  const hub = mallHubs.find((item) => item.id === filters.hubId);
  const type = filters.type === "physical" || filters.type === "digital"
    ? filters.type
    : undefined;
  const path = explorePath(hub?.id, type);

  if (hub && type === "physical") {
    return shareMetadata({
      title: `${hub.name} · physical`,
      description: `${hub.blurb} Things you can hold in this aisle — condition first, no lookbook.`,
      path,
    });
  }

  if (hub && type === "digital") {
    return shareMetadata({
      title: `${hub.name} · digital`,
      description:
        hub.id === "download-stall"
          ? `${hub.blurb} Files from the same stalls as the junk. Format stands in for condition.`
          : `${hub.name} does not keep a separate file shop. Digital listings live in Download Stall.`,
      path,
    });
  }

  if (hub) {
    const count = listingsByHub(hub.id).length;
    return shareMetadata({
      title: `${hub.name} on the concourse`,
      description: `${hub.blurb} ${count} ${count === 1 ? "listing" : "listings"} in ${hub.name}, including sold and file-gone. ${hub.rule}`,
      path,
    });
  }

  if (type === "physical") {
    return shareMetadata({
      title: "Physical finds on the concourse",
      description:
        "Objects on the tables across every stall. Condition is the listing. Sold stays on the floor so you can see what walked.",
      path,
    });
  }

  if (type === "digital") {
    return shareMetadata({
      title: "Digital files on the concourse",
      description:
        "PDFs, beats, presets, and packs from the same stalls as the junk. Not a second storefront.",
      path,
    });
  }

  return shareMetadata({
    title: "Explore the concourse",
    description:
      "The general mall floor. Filter the stand-in catalog by hub or physical/digital. Paid corners are labeled.",
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
    title: "Four aisles",
    description:
      "Yard Sale, Closet Overflow, Garage Tech, and Download Stall. Each hub refuses the wrong inventory. Explore stays the general concourse.",
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
      "No artisan-home wing. No junk drawer. The floors are Yard Sale, Closet Overflow, Garage Tech, and Download Stall.",
    path: "/hubs",
    robots: noIndexFollow,
  });
}

export function listingMetadata(listing: Listing): Metadata {
  const stall = stallById(listing.stallId);
  const hub = hubById(listing.hubId);
  const price = formatMoney(listing.price);
  const fact = listingFact(listing);
  const factLabel = isPhysicalListing(listing) ? "Condition" : "Format";
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
    additionalType: isPhysicalListing(listing)
      ? "https://schema.org/Product"
      : "https://schema.org/DigitalDocument",
    itemCondition: isPhysicalListing(listing)
      ? "https://schema.org/UsedCondition"
      : undefined,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: isPhysicalListing(listing) ? "condition" : "fileFormat",
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

function explorePath(hubId?: string, type?: string) {
  const params = new URLSearchParams();
  if (hubId) params.set("hub", hubId);
  if (type) params.set("type", type);
  const query = params.toString();
  return query ? `/explore?${query}` : "/explore";
}
