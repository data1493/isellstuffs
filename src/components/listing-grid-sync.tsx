"use client";

import { useEffect } from "react";

import { GRID_STORAGE_KEY, gridCookieValue } from "@/lib/listing-grid";

/** Copy the cookie grid set into `iss:grid-listing-ids` after a no-JS POST. */
export function SyncGrid({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GRID_STORAGE_KEY,
        gridCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
