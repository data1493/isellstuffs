"use client";

import { useEffect } from "react";

import { PILLOW_STORAGE_KEY, pillowCookieValue } from "@/lib/listing-pillow";

/** Copy the cookie pillow set into `iss:pillow-listing-ids` after a no-JS POST. */
export function SyncPillow({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PILLOW_STORAGE_KEY,
        pillowCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
