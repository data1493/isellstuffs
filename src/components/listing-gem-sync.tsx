"use client";

import { useEffect } from "react";

import { GEM_STORAGE_KEY, gemCookieValue } from "@/lib/listing-gem";

/** Copy the cookie gem set into `iss:gem-listing-ids` after a no-JS POST. */
export function SyncGem({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(GEM_STORAGE_KEY, gemCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
