import {
  allListings,
  listingTypes,
  mallHubs,
  money,
  stallById,
  type HubId,
  type Listing,
  type ListingType,
} from "@/lib/commerce";

export const physicalHubIds = [
  "yard-sale",
  "closet-overflow",
  "garage-tech",
] as const satisfies readonly HubId[];

export type SellerListingError = {
  ok: false;
  error: string;
};

export type SellerListingOk = {
  ok: true;
  listing: Listing;
};

export type SellerListingResult = SellerListingOk | SellerListingError;

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function slugifyTitle(title: string) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "untitled";
}

export function uniqueSellerListingId(type: ListingType, title: string) {
  const base = `sell-${type}-${slugifyTitle(title)}`;
  const taken = new Set(allListings().map((listing) => listing.id));
  if (!taken.has(base)) {
    return base;
  }

  let n = 2;
  let id = `${base}-${n}`;
  while (taken.has(id)) {
    n += 1;
    id = `${base}-${n}`;
  }
  return id;
}

export function isPhysicalHubId(value: string): value is HubId {
  return physicalHubIds.some((id) => id === value);
}

export function parseSellerListing(formData: FormData): SellerListingResult {
  const title = readString(formData, "title");
  const summary = readString(formData, "summary");
  const stallId = readString(formData, "stallId");
  const typeRaw = readString(formData, "type");
  const hubRaw = readString(formData, "hubId");
  const priceRaw = readString(formData, "price");
  const condition = readString(formData, "condition");
  const fileFormat = readString(formData, "fileFormat");

  if (!title) {
    return { ok: false, error: "Give it a name. Empty tags do not sell." };
  }

  if (!summary) {
    return {
      ok: false,
      error: "Say what it is. One honest sentence is enough.",
    };
  }

  const type = listingTypes.find((item) => item === typeRaw);
  if (!type) {
    return {
      ok: false,
      error: "Pick physical or digital. One stall can list both.",
    };
  }

  const stall = stallById(stallId);
  if (!stall) {
    return {
      ok: false,
      error: "That stall is not on this floor. Pick a booth that already exists.",
    };
  }

  const dollars = Number(priceRaw);
  if (!Number.isFinite(dollars) || dollars <= 0) {
    return { ok: false, error: "Price has to be more than $0." };
  }

  const amountCents = Math.round(dollars * 100);
  if (amountCents <= 0) {
    return { ok: false, error: "Price has to be more than $0." };
  }

  if (type === "digital") {
    if (hubRaw && hubRaw !== "download-stall") {
      return {
        ok: false,
        error:
          "Files live in Download Stall. Digital is a listing type, not a closet zip.",
      };
    }
    if (!fileFormat) {
      return {
        ok: false,
        error: "Say the file format. PDF, WAV, OTF — not “digital asset.”",
      };
    }

    return {
      ok: true,
      listing: {
        id: uniqueSellerListingId(type, title),
        stallId: stall.id,
        type: "digital",
        title,
        summary,
        hubId: "download-stall",
        price: money(amountCents),
        fileFormat,
        cartEligible: true,
        status: "available",
      },
    };
  }

  if (hubRaw === "download-stall") {
    return {
      ok: false,
      error:
        "Download Stall is for files. A lamp does not belong in a folder.",
    };
  }

  if (!isPhysicalHubId(hubRaw)) {
    return {
      ok: false,
      error:
        "Physical junk sits in Yard Sale, Closet Overflow, or Garage Tech.",
    };
  }

  if (!condition) {
    return {
      ok: false,
      error: "Condition is the listing. “Tested, kinda” is valid copy.",
    };
  }

  const hub = mallHubs.find((item) => item.id === hubRaw);
  if (!hub) {
    return { ok: false, error: "That aisle is not on the map." };
  }

  return {
    ok: true,
    listing: {
      id: uniqueSellerListingId(type, title),
      stallId: stall.id,
      type: "physical",
      title,
      summary,
      hubId: hub.id,
      price: money(amountCents),
      condition,
      cartEligible: true,
      status: "available",
    },
  };
}
