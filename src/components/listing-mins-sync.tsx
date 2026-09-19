"use client";

import { useEffect } from "react";

import { MINS_STORAGE_KEY, minsCookieValue } from "@/lib/listing-mins";

/** Copy the cookie mins set into `iss:mins-listing-ids` after a no-JS POST. */
export function SyncMins({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(MINS_STORAGE_KEY, minsCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
