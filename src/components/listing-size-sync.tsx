"use client";

import { useEffect } from "react";

import { SIZE_STORAGE_KEY, sizeCookieValue } from "@/lib/listing-size";

/** Copy the cookie size set into `iss:size-listing-ids` after a no-JS POST. */
export function SyncSize({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SIZE_STORAGE_KEY,
        sizeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
