"use client";

import { useEffect } from "react";

import { HOOD_STORAGE_KEY, hoodCookieValue } from "@/lib/listing-hood";

/** Copy the cookie hood set into `iss:hood-listing-ids` after a no-JS POST. */
export function SyncHood({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(HOOD_STORAGE_KEY, hoodCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
