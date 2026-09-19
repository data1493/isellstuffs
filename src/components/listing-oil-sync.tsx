"use client";

import { useEffect } from "react";

import { OIL_STORAGE_KEY, oilCookieValue } from "@/lib/listing-oil";

/** Copy the cookie oil set into `iss:oil-listing-ids` after a no-JS POST. */
export function SyncOil({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(OIL_STORAGE_KEY, oilCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
