import {
  allListings,
  listings,
  listingTypes,
  mallHubs,
  money,
  physicalHubs,
  stallById,
  type HubId,
  type Listing,
  type ListingType,
} from "@/lib/commerce";
import { sellerListingById } from "@/lib/seller-overlay";
import { isGiftFileFormat } from "@/lib/sell-start";

export const physicalHubIds = physicalHubs().map((hub) => hub.id);

export type SellerListingError = {
  ok: false;
  error: string;
};

export type SellerListingOk = {
  ok: true;
  listing: Listing;
};

export type SellerListingResult = SellerListingOk | SellerListingError;

export type ParseSellerListingOptions = {
  /** Overlay id to keep. Create path omits this and mints a new SKU. */
  existingId?: string;
};

export function isFixtureListingId(id: string) {
  return listings.some((row) => row.id === id);
}

export function retapeRefuseCopy(kind: "fixture" | "missing") {
  if (kind === "fixture") {
    return {
      eyebrow: "Taped down",
      title: "Catalog fixtures stay put.",
      body: "You cannot retape the lamp, the chair, or the gift card. Those rows live in the catalog. Retape is for something you listed tonight.",
    };
  }

  return {
    eyebrow: "Packed up",
    title: "That listing is not on this table.",
    body: "Retape is for overlay rows you put on a stall. List it first, then fix the typo.",
  };
}

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

export function parseSellerListing(
  formData: FormData,
  options: ParseSellerListingOptions = {},
): SellerListingResult {
  const existingId = options.existingId?.trim() ?? "";
  const existing = existingId ? sellerListingById(existingId) : undefined;

  if (existingId) {
    if (isFixtureListingId(existingId)) {
      return {
        ok: false,
        error:
          "Catalog fixtures stay taped down. You cannot retape a row that already lives in the catalog.",
      };
    }
    if (!existing) {
      return {
        ok: false,
        error: "That listing is not on the overlay. List it first, then retape.",
      };
    }
  }

  const title = readString(formData, "title");
  const summary = readString(formData, "summary");
  const stallId = existing ? existing.stallId : readString(formData, "stallId");
  const typeRaw = existing ? existing.type : readString(formData, "type");
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
    if (existing && isGiftFileFormat(fileFormat)) {
      return {
        ok: false,
        error:
          "The mall already sells one gift card. Retape a file — PDF, WAV, OTF.",
      };
    }

    return {
      ok: true,
      listing: {
        id: existing?.id ?? uniqueSellerListingId(type, title),
        stallId: stall.id,
        type: "digital",
        title,
        summary,
        hubId: "download-stall",
        price: money(amountCents),
        fileFormat,
        cartEligible: existing?.cartEligible ?? true,
        status: existing?.status ?? "available",
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
        `Physical junk sits in ${physicalHubs()
          .map((hub) => hub.name)
          .join(", ")
          .replace(/, ([^,]+)$/, ", or $1")}.`,
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
      id: existing?.id ?? uniqueSellerListingId(type, title),
      stallId: stall.id,
      type: "physical",
      title,
      summary,
      hubId: hub.id,
      price: money(amountCents),
      condition,
      cartEligible: existing?.cartEligible ?? true,
      status: existing?.status ?? "available",
    },
  };
}
