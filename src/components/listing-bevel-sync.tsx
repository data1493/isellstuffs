"use client";

import { useEffect } from "react";

import { BEVEL_STORAGE_KEY, bevelCookieValue } from "@/lib/listing-bevel";

/** Copy the cookie bevel set into `iss:bevel-listing-ids` after a no-JS POST. */
export function SyncBevel({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        BEVEL_STORAGE_KEY,
        bevelCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
