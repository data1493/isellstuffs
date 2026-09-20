"use client";

import { useEffect } from "react";

import { ZENITH_STORAGE_KEY, zenithCookieValue } from "@/lib/listing-zenith";

/** Copy the cookie zenith set into `iss:zenith-listing-ids` after a no-JS POST. */
export function SyncZenith({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        ZENITH_STORAGE_KEY,
        zenithCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
