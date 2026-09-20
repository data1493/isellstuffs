"use client";

import { useEffect } from "react";

import { TOMBSTONE_STORAGE_KEY, tombstoneCookieValue } from "@/lib/listing-tombstone";

/** Copy the cookie tombstone set into `iss:tombstone-listing-ids` after a no-JS POST. */
export function SyncTombstone({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        TOMBSTONE_STORAGE_KEY,
        tombstoneCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
