"use client";

import { useEffect } from "react";

import { SNUG_STORAGE_KEY, snugCookieValue } from "@/lib/listing-snug";

/** Copy the cookie snug set into `iss:snug-listing-ids` after a no-JS POST. */
export function SyncSnug({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SNUG_STORAGE_KEY,
        snugCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
