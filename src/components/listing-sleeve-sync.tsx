"use client";

import { useEffect } from "react";

import { SLEEVE_STORAGE_KEY, sleeveCookieValue } from "@/lib/listing-sleeve";

/** Copy the cookie sleeve set into `iss:sleeve-listing-ids` after a no-JS POST. */
export function SyncSleeve({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SLEEVE_STORAGE_KEY,
        sleeveCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
