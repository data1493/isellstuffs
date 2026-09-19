"use client";

import { useEffect } from "react";

import { CEMENT_STORAGE_KEY, cementCookieValue } from "@/lib/listing-cement";

/** Copy the cookie cement set into `iss:cement-listing-ids` after a no-JS POST. */
export function SyncCement({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        CEMENT_STORAGE_KEY,
        cementCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
