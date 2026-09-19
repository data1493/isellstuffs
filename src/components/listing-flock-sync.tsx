"use client";

import { useEffect } from "react";

import { FLOCK_STORAGE_KEY, flockCookieValue } from "@/lib/listing-flock";

/** Copy the cookie flock set into `iss:flock-listing-ids` after a no-JS POST. */
export function SyncFlock({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(FLOCK_STORAGE_KEY, flockCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
