"use client";

import { useEffect } from "react";

import { BUSH_STORAGE_KEY, bushCookieValue } from "@/lib/listing-bush";

/** Copy the cookie bush set into `iss:bush-listing-ids` after a no-JS POST. */
export function SyncBush({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        BUSH_STORAGE_KEY,
        bushCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
