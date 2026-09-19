"use client";

import { useEffect } from "react";

import { CRUSH_STORAGE_KEY, crushCookieValue } from "@/lib/listing-crush";

/** Copy the cookie crush set into `iss:crush-listing-ids` after a no-JS POST. */
export function SyncCrush({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(CRUSH_STORAGE_KEY, crushCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
