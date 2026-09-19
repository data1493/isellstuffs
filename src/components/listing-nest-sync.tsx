"use client";

import { useEffect } from "react";

import { NEST_STORAGE_KEY, nestCookieValue } from "@/lib/listing-nest";

/** Copy the cookie nest set into `iss:nest-listing-ids` after a no-JS POST. */
export function SyncNest({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(NEST_STORAGE_KEY, nestCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
