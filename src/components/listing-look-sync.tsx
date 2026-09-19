"use client";

import { useEffect } from "react";

import {
  LOOK_STORAGE_KEY,
  lookCookieValue,
} from "@/lib/look-overlay";

/** Copy the cookie look set into `iss:look-listing-ids` after a no-JS POST. */
export function SyncLook({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(LOOK_STORAGE_KEY, lookCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
