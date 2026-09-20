"use client";

import { useEffect } from "react";

import { BISQUE_STORAGE_KEY, bisqueCookieValue } from "@/lib/listing-bisque";

/** Copy the cookie bisque set into `iss:bisque-listing-ids` after a no-JS POST. */
export function SyncBisque({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        BISQUE_STORAGE_KEY,
        bisqueCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
