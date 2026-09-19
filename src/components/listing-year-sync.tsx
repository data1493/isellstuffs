"use client";

import { useEffect } from "react";

import { YEAR_STORAGE_KEY, yearCookieValue } from "@/lib/listing-year";

/** Copy the cookie year set into `iss:year-listing-ids` after a no-JS POST. */
export function SyncYear({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        YEAR_STORAGE_KEY,
        yearCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
