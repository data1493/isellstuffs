"use client";

import { useEffect } from "react";

import { SWAGE_STORAGE_KEY, swageCookieValue } from "@/lib/listing-swage";

/** Copy the cookie swage set into `iss:swage-listing-ids` after a no-JS POST. */
export function SyncSwage({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SWAGE_STORAGE_KEY,
        swageCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
