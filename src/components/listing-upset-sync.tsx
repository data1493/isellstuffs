"use client";

import { useEffect } from "react";

import { UPSET_STORAGE_KEY, upsetCookieValue } from "@/lib/listing-upset";

/** Copy the cookie upset set into `iss:upset-listing-ids` after a no-JS POST. */
export function SyncUpset({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        UPSET_STORAGE_KEY,
        upsetCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
