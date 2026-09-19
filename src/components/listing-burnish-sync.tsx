"use client";

import { useEffect } from "react";

import { BURNISH_STORAGE_KEY, burnishCookieValue } from "@/lib/listing-burnish";

/** Copy the cookie burnish set into `iss:burnish-listing-ids` after a no-JS POST. */
export function SyncBurnish({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        BURNISH_STORAGE_KEY,
        burnishCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
