"use client";

import { useEffect } from "react";

import { SUBSET_STORAGE_KEY, subsetCookieValue } from "@/lib/listing-subset";

/** Copy the cookie subset set into `iss:subset-listing-ids` after a no-JS POST. */
export function SyncSubset({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SUBSET_STORAGE_KEY,
        subsetCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
