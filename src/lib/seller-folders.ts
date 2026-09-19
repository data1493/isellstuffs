/**
 * Seller folder tape. Paid digital files from slips in this browser.
 * Queue owns physicals. Gift desk owns codes. Buyer `/folder` is unchanged.
 * File-gone after pay still lists — they paid; pull is not a refund.
 */
import {
  isDigitalListing,
  isGiftListing,
  type DigitalListing,
  type Stall,
} from "@/lib/commerce";
import { liveListingById, liveStallById } from "@/lib/live-catalog";
import type { OrderSlip } from "@/lib/order-history";

export type FolderTapeSlip = Pick<OrderSlip, "id" | "listingIds">;

export type FolderTapeFile = {
  slipId: string;
  listing: DigitalListing;
  stall: Stall;
  pulled: boolean;
};

export type FolderTapeBooth = {
  stall: Stall;
  files: FolderTapeFile[];
};

export function mergeFolderTapeSlips(
  stored: FolderTapeSlip[],
  seed: FolderTapeSlip | null,
): FolderTapeSlip[] {
  if (!seed) {
    return stored;
  }
  if (stored.some((slip) => slip.id === seed.id)) {
    return stored;
  }
  return [seed, ...stored];
}

/** Digital, non-gift lines. File-gone still counts — orders are the register. */
export function folderTapeFilesOnSlip(
  listingIds: string[],
  slipId: string,
): FolderTapeFile[] {
  const files: FolderTapeFile[] = [];
  const seen = new Set<string>();

  for (const id of listingIds) {
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);

    const listing = liveListingById(id);
    if (!listing || !isDigitalListing(listing)) {
      continue;
    }
    if (isGiftListing(listing)) {
      continue;
    }

    const stall = liveStallById(listing.stallId);
    if (!stall) {
      continue;
    }

    files.push({
      slipId,
      listing,
      stall,
      pulled: listing.status === "file-gone",
    });
  }

  return files;
}

/** Paid files grouped by booth. Same SKU on two slips is two lines. */
export function folderTapeBoothsFromSlips(
  slips: FolderTapeSlip[],
): FolderTapeBooth[] {
  const booths = new Map<string, FolderTapeBooth>();
  const seen = new Set<string>();

  for (const slip of slips) {
    for (const file of folderTapeFilesOnSlip(slip.listingIds, slip.id)) {
      const key = `${file.slipId}:${file.listing.id}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const existing = booths.get(file.stall.id);
      if (existing) {
        existing.files.push(file);
        continue;
      }

      booths.set(file.stall.id, {
        stall: file.stall,
        files: [file],
      });
    }
  }

  return [...booths.values()];
}

export function folderTapeHasFiles(slips: FolderTapeSlip[]): boolean {
  return slips.some(
    (slip) => folderTapeFilesOnSlip(slip.listingIds, slip.id).length > 0,
  );
}

export function boothHasFolderTape(
  slips: FolderTapeSlip[],
  stallId: string,
): boolean {
  if (!stallId) {
    return false;
  }
  return folderTapeBoothsFromSlips(slips).some(
    (booth) => booth.stall.id === stallId,
  );
}
