"use client";

import { useEffect } from "react";

import { BLUEZONE_STORAGE_KEY, bluezoneCookieValue } from "@/lib/listing-bluezone";

/** Copy the cookie bluezone set into `iss:bluezone-listing-ids` after a no-JS POST. */
export function SyncBluezone({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        BLUEZONE_STORAGE_KEY,
        bluezoneCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
