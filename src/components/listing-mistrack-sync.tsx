"use client";

import { useEffect } from "react";

import { MISTRACK_STORAGE_KEY, mistrackCookieValue } from "@/lib/listing-mistrack";

/** Copy the cookie mistrack set into `iss:mistrack-listing-ids` after a no-JS POST. */
export function SyncMistrack({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        MISTRACK_STORAGE_KEY,
        mistrackCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
