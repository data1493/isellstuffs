"use client";

import { useEffect } from "react";

import { SHANK_STORAGE_KEY, shankCookieValue } from "@/lib/listing-shank";

/** Copy the cookie shank set into `iss:shank-listing-ids` after a no-JS POST. */
export function SyncShank({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(SHANK_STORAGE_KEY, shankCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
