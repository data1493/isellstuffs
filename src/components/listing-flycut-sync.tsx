"use client";

import { useEffect } from "react";

import { FLYCUT_STORAGE_KEY, flycutCookieValue } from "@/lib/listing-flycut";

/** Copy the cookie flycut set into `iss:flycut-listing-ids` after a no-JS POST. */
export function SyncFlycut({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        FLYCUT_STORAGE_KEY,
        flycutCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
