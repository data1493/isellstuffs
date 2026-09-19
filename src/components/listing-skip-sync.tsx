"use client";

import { useEffect } from "react";

import { SKIP_STORAGE_KEY, skipCookieValue } from "@/lib/listing-skip";

/** Copy the cookie skip set into `iss:skip-listing-ids` after a no-JS POST. */
export function SyncSkip({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SKIP_STORAGE_KEY,
        skipCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
