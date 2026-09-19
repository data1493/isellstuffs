"use client";

import { useEffect } from "react";

import { PEEN_STORAGE_KEY, peenCookieValue } from "@/lib/listing-peen";

/** Copy the cookie peen set into `iss:peen-listing-ids` after a no-JS POST. */
export function SyncPeen({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PEEN_STORAGE_KEY,
        peenCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
