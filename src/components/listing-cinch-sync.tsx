"use client";

import { useEffect } from "react";

import { CINCH_STORAGE_KEY, cinchCookieValue } from "@/lib/listing-cinch";

/** Copy the cookie cinch set into `iss:cinch-listing-ids` after a no-JS POST. */
export function SyncCinch({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(CINCH_STORAGE_KEY, cinchCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
