"use client";

import { useEffect } from "react";

import { CHIP_STORAGE_KEY, chipCookieValue } from "@/lib/listing-chip";

/** Copy the cookie chip set into `iss:chip-listing-ids` after a no-JS POST. */
export function SyncChip({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(CHIP_STORAGE_KEY, chipCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
