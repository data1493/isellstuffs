"use client";

import { useEffect } from "react";

import { SHOT_STORAGE_KEY, shotCookieValue } from "@/lib/listing-shot";

/** Copy the cookie shot set into `iss:shot-listing-ids` after a no-JS POST. */
export function SyncShot({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(SHOT_STORAGE_KEY, shotCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
