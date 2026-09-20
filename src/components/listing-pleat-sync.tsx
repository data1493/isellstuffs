"use client";

import { useEffect } from "react";

import { PLEAT_STORAGE_KEY, pleatCookieValue } from "@/lib/listing-pleat";

/** Copy the cookie pleat set into `iss:pleat-listing-ids` after a no-JS POST. */
export function SyncPleat({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PLEAT_STORAGE_KEY,
        pleatCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
