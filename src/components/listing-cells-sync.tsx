"use client";

import { useEffect } from "react";

import { CELLS_STORAGE_KEY, cellsCookieValue } from "@/lib/listing-cells";

/** Copy the cookie cells set into `iss:cells-listing-ids` after a no-JS POST. */
export function SyncCells({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        CELLS_STORAGE_KEY,
        cellsCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
