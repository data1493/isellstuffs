"use client";

import { useEffect } from "react";

import { AVAR_STORAGE_KEY, avarCookieValue } from "@/lib/listing-avar";

/** Copy the cookie avar set into `iss:avar-listing-ids` after a no-JS POST. */
export function SyncAvar({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        AVAR_STORAGE_KEY,
        avarCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
