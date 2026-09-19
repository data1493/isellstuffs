"use client";

import { useEffect } from "react";

import { LINING_STORAGE_KEY, liningCookieValue } from "@/lib/listing-lining";

/** Copy the cookie lining set into `iss:lining-listing-ids` after a no-JS POST. */
export function SyncLining({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(LINING_STORAGE_KEY, liningCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
