"use client";

import { useEffect } from "react";

import { LOOM_STORAGE_KEY, loomCookieValue } from "@/lib/listing-loom";

/** Copy the cookie loom set into `iss:loom-listing-ids` after a no-JS POST. */
export function SyncLoom({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        LOOM_STORAGE_KEY,
        loomCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
