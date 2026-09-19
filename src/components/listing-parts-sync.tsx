"use client";

import { useEffect } from "react";

import { PARTS_STORAGE_KEY, partsCookieValue } from "@/lib/listing-parts";

/** Copy the cookie parts set into `iss:parts-listing-ids` after a no-JS POST. */
export function SyncParts({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PARTS_STORAGE_KEY,
        partsCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
