"use client";

import { useEffect } from "react";

import { ERASE_STORAGE_KEY, eraseCookieValue } from "@/lib/listing-erase";

/** Copy the cookie erase set into `iss:erase-listing-ids` after a no-JS POST. */
export function SyncErase({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        ERASE_STORAGE_KEY,
        eraseCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
