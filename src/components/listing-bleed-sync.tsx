"use client";

import { useEffect } from "react";

import { BLEED_STORAGE_KEY, bleedCookieValue } from "@/lib/listing-bleed";

/** Copy the cookie bleed set into `iss:bleed-listing-ids` after a no-JS POST. */
export function SyncBleed({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        BLEED_STORAGE_KEY,
        bleedCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
