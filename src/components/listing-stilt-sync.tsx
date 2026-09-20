"use client";

import { useEffect } from "react";

import { STILT_STORAGE_KEY, stiltCookieValue } from "@/lib/listing-stilt";

/** Copy the cookie stilt set into `iss:stilt-listing-ids` after a no-JS POST. */
export function SyncStilt({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STILT_STORAGE_KEY,
        stiltCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
