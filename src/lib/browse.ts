import {
  allListings,
  hubFloorList,
  mallHubs,
  type HubId,
  type Listing,
} from "@/lib/commerce";

/** Presentation only — not a commerce shape. */
export const hubAtmosphere: Record<
  HubId,
  { wash: string; floor: string; refuse: string }
> = {
  "yard-sale": {
    wash: "bg-[oklch(0.88_0.08_85)]",
    floor: "Driveway table",
    refuse: "No artisan home.",
  },
  "closet-overflow": {
    wash: "bg-[oklch(0.86_0.05_20)]",
    floor: "Hall closet",
    refuse: "No lookbook.",
  },
  "garage-tech": {
    wash: "bg-[oklch(0.84_0.05_145)]",
    floor: "Workbench",
    refuse: "Condition is the copy.",
  },
  "media-bin": {
    wash: "bg-[oklch(0.86_0.06_300)]",
    floor: "Crate under the table",
    refuse: "No streaming codes.",
  },
  "kitchen-drawer": {
    wash: "bg-[oklch(0.87_0.06_50)]",
    floor: "Next to the sink",
    refuse: "No staged sets.",
  },
  "download-stall": {
    wash: "bg-[oklch(0.86_0.045_195)]",
    floor: "Folder on the table",
    refuse: "Not a second site.",
  },
};

/** Same pocket-money ceiling as collections under-a-ten. Not a Money shape. */
export const UNDER_TEN_CENTS = 1000;
export const UNDER_TWENTY_FIVE_CENTS = 2500;

export const exploreAvails = ["open", "all"] as const;
export type ExploreAvail = (typeof exploreAvails)[number];

export const exploreMaxes = ["10", "25"] as const;
export type ExploreMax = (typeof exploreMaxes)[number];

export const exploreSorts = ["price", "price-desc"] as const;
export type ExploreSort = (typeof exploreSorts)[number];

export type ExploreFilters = {
  hubId?: HubId;
  type?: Listing["type"];
  avail?: ExploreAvail;
  max?: ExploreMax;
  sort?: ExploreSort;
};

export type ExploreQuery = ExploreFilters & {
  unknown: boolean;
};

export function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function isHubId(value: string | undefined): value is HubId {
  return mallHubs.some((hub) => hub.id === value);
}

export function isListingType(
  value: string | undefined,
): value is Listing["type"] {
  return value === "physical" || value === "digital";
}

export function isExploreAvail(
  value: string | undefined,
): value is ExploreAvail {
  return value === "open" || value === "all";
}

export function isExploreMax(value: string | undefined): value is ExploreMax {
  return value === "10" || value === "25";
}

export function isExploreSort(value: string | undefined): value is ExploreSort {
  return value === "price" || value === "price-desc";
}

export function hubBySlug(slug: string) {
  return mallHubs.find((hub) => hub.slug === slug);
}

export function parseExploreFilters(params: {
  [key: string]: string | string[] | undefined;
}): ExploreQuery {
  const hubParam = firstSearchParam(params.hub);
  const typeParam = firstSearchParam(params.type);
  const availParam = firstSearchParam(params.avail);
  const maxParam = firstSearchParam(params.max);
  const sortParam = firstSearchParam(params.sort);

  const hubId = isHubId(hubParam) ? hubParam : undefined;
  const type = isListingType(typeParam) ? typeParam : undefined;
  const avail = isExploreAvail(availParam) ? availParam : undefined;
  const max = isExploreMax(maxParam) ? maxParam : undefined;
  const sort = isExploreSort(sortParam) ? sortParam : undefined;

  const unknown = Boolean(
    (hubParam && !hubId) ||
      (typeParam && !type) ||
      (availParam && !avail) ||
      (maxParam && !max) ||
      (sortParam && !sort),
  );

  return { hubId, type, avail, max, sort, unknown };
}

function maxCeilingCents(max?: ExploreMax): number | undefined {
  if (max === "10") return UNDER_TEN_CENTS;
  if (max === "25") return UNDER_TWENTY_FIVE_CENTS;
  return undefined;
}

export function filterListings(filters: ExploreFilters): Listing[] {
  const ceiling = maxCeilingCents(filters.max);

  return allListings().filter((listing) => {
    if (filters.hubId && listing.hubId !== filters.hubId) return false;
    if (filters.type && listing.type !== filters.type) return false;
    if (filters.avail === "open") {
      if (listing.status !== "available" || !listing.cartEligible) return false;
    }
    if (ceiling !== undefined && listing.price.amountCents >= ceiling) {
      return false;
    }
    return true;
  });
}

export function sortListings(
  listings: Listing[],
  sort?: ExploreSort,
): Listing[] {
  if (sort === "price") {
    return [...listings].sort(
      (left, right) => left.price.amountCents - right.price.amountCents,
    );
  }
  if (sort === "price-desc") {
    return [...listings].sort(
      (left, right) => right.price.amountCents - left.price.amountCents,
    );
  }
  return listings;
}

export function browseListings(filters: ExploreFilters): Listing[] {
  return sortListings(filterListings(filters), filters.sort);
}

export function exploreHref(filters: ExploreFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.hubId) params.set("hub", filters.hubId);
  if (filters.type) params.set("type", filters.type);
  if (filters.avail && filters.avail !== "all") params.set("avail", filters.avail);
  if (filters.max) params.set("max", filters.max);
  if (filters.sort) params.set("sort", filters.sort);
  const query = params.toString();
  return query ? `/explore?${query}` : "/explore";
}

/** Paid featured booth only when the concourse is idle. */
export function exploreShowsFeatured(query: ExploreQuery): boolean {
  if (query.unknown) return false;
  return !query.hubId && !query.type && !query.avail && !query.max && !query.sort;
}

export function exploreStackBits(filters: ExploreFilters): string[] {
  const bits: string[] = [];
  if (filters.type) bits.push(filters.type);
  if (filters.avail === "open") bits.push("still here");
  if (filters.max === "10") bits.push("under a ten");
  if (filters.max === "25") bits.push("under $25");
  if (filters.sort === "price") bits.push("cheapest first");
  if (filters.sort === "price-desc") bits.push("dearest first");
  return bits;
}

export function exploreCountLine(
  count: number,
  filters: ExploreFilters,
  hubName?: string,
): string {
  const things = `${count} ${count === 1 ? "thing" : "things"}`;
  const place = hubName ? `in ${hubName}` : "on the floor";
  return [things + " " + place, ...exploreStackBits(filters)].join(" · ");
}

export function exploreEmptyCopy(
  query: ExploreQuery,
  hubName?: string,
): { title: string; body: string } {
  if (query.unknown) {
    return {
      title: "That filter is not on the map.",
      body: `Hubs are ${hubFloorList()}. Kind is physical or digital. On the floor is all or still here. Price is under a ten or under $25.`,
    };
  }

  const stack = exploreStackBits(query).join(" · ");

  if (query.type === "digital" && query.hubId && query.hubId !== "download-stall") {
    return {
      title: "This combination is picked over.",
      body: `${hubName ?? "This aisle"} does not have digital listings right now. Digital lives in Download Stall. Clothes do not come as a zip.`,
    };
  }

  if (hubName && stack) {
    return {
      title: "This combination is picked over.",
      body: `${hubName} has nothing ${stack}. Sold and file-gone stay unless you pick still here. Digital lives in Download Stall.`,
    };
  }

  if (hubName) {
    return {
      title: "This combination is picked over.",
      body: `${hubName} does not have those listings right now. Digital lives in Download Stall. Clothes do not come as a zip.`,
    };
  }

  if (stack) {
    return {
      title: "This combination is picked over.",
      body: `Nothing on the floor is ${stack}. Clear a chip and walk the concourse again.`,
    };
  }

  return {
    title: "This combination is picked over.",
    body: "Nothing matches. Clear the filters and walk the concourse again.",
  };
}
