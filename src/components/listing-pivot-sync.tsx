"use client";

import { useEffect } from "react";

import { PIVOT_STORAGE_KEY, pivotCookieValue } from "@/lib/listing-pivot";

/** Copy the cookie pivot set into `iss:pivot-listing-ids` after a no-JS POST. */
export function SyncPivot({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PIVOT_STORAGE_KEY,
        pivotCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
