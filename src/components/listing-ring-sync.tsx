"use client";

import { useEffect } from "react";

import { RING_STORAGE_KEY, ringCookieValue } from "@/lib/listing-ring";

/** Copy the cookie water-ring set into `iss:ring-listing-ids` after a no-JS POST. */
export function SyncRing({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        RING_STORAGE_KEY,
        ringCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
