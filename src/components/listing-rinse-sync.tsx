"use client";

import { useEffect } from "react";

import { RINSE_STORAGE_KEY, rinseCookieValue } from "@/lib/listing-rinse";

/** Copy the cookie rinse set into `iss:rinse-listing-ids` after a no-JS POST. */
export function SyncRinse({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        RINSE_STORAGE_KEY,
        rinseCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
