"use client";

import { useEffect } from "react";

import { HEAVY_STORAGE_KEY, heavyCookieValue } from "@/lib/listing-heavy";

/** Copy the cookie heavy set into `iss:heavy-listing-ids` after a no-JS POST. */
export function SyncHeavy({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(HEAVY_STORAGE_KEY, heavyCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
