"use client";

import { useEffect } from "react";

import { RIAA_STORAGE_KEY, riaaCookieValue } from "@/lib/listing-riaa";

/** Copy the cookie riaa set into `iss:riaa-listing-ids` after a no-JS POST. */
export function SyncRiaa({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        RIAA_STORAGE_KEY,
        riaaCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
