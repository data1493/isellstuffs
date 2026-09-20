"use client";

import { useEffect } from "react";

import { SHAPER_STORAGE_KEY, shaperCookieValue } from "@/lib/listing-shaper";

/** Copy the cookie shaper set into `iss:shaper-listing-ids` after a no-JS POST. */
export function SyncShaper({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SHAPER_STORAGE_KEY,
        shaperCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
