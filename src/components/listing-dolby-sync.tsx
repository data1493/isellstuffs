"use client";

import { useEffect } from "react";

import { DOLBY_STORAGE_KEY, dolbyCookieValue } from "@/lib/listing-dolby";

/** Copy the cookie Dolby set into `iss:dolby-listing-ids` after a no-JS POST. */
export function SyncDolby({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        DOLBY_STORAGE_KEY,
        dolbyCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
