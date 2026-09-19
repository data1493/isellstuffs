"use client";

import { useEffect } from "react";

import { POCKETS_STORAGE_KEY, pocketsCookieValue } from "@/lib/listing-pockets";

/** Copy the cookie pockets set into `iss:pockets-listing-ids` after a no-JS POST. */
export function SyncPockets({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        POCKETS_STORAGE_KEY,
        pocketsCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
