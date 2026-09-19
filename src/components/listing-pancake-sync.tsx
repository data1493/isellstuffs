"use client";

import { useEffect } from "react";

import { PANCAKE_STORAGE_KEY, pancakeCookieValue } from "@/lib/listing-pancake";

/** Copy the cookie pancake set into `iss:pancake-listing-ids` after a no-JS POST. */
export function SyncPancake({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PANCAKE_STORAGE_KEY,
        pancakeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
