"use client";

import { useEffect } from "react";

import { REAM_STORAGE_KEY, reamCookieValue } from "@/lib/listing-ream";

/** Copy the cookie ream set into `iss:ream-listing-ids` after a no-JS POST. */
export function SyncReam({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        REAM_STORAGE_KEY,
        reamCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
