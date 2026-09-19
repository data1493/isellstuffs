"use client";

import { useEffect } from "react";

import { GRAIN_STORAGE_KEY, grainCookieValue } from "@/lib/listing-grain";

/** Copy the cookie grain set into `iss:grain-listing-ids` after a no-JS POST. */
export function SyncGrain({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GRAIN_STORAGE_KEY,
        grainCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
