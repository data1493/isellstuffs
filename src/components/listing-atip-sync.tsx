"use client";

import { useEffect } from "react";

import { ATIP_STORAGE_KEY, atipCookieValue } from "@/lib/listing-atip";

/** Copy the cookie atip set into `iss:atip-listing-ids` after a no-JS POST. */
export function SyncAtip({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        ATIP_STORAGE_KEY,
        atipCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
