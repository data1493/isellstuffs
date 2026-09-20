"use client";

import { useEffect } from "react";

import { SPRIG_STORAGE_KEY, sprigCookieValue } from "@/lib/listing-sprig";

/** Copy the cookie sprig set into `iss:sprig-listing-ids` after a no-JS POST. */
export function SyncSprig({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SPRIG_STORAGE_KEY,
        sprigCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
