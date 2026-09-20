"use client";

import { useEffect } from "react";

import { SKIVE_STORAGE_KEY, skiveCookieValue } from "@/lib/listing-skive";

/** Copy the cookie skive set into `iss:skive-listing-ids` after a no-JS POST. */
export function SyncSkive({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(SKIVE_STORAGE_KEY, skiveCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
