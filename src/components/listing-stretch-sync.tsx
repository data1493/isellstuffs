"use client";

import { useEffect } from "react";

import { STRETCH_STORAGE_KEY, stretchCookieValue } from "@/lib/listing-stretch";

/** Copy the cookie stretch set into `iss:stretch-listing-ids` after a no-JS POST. */
export function SyncStretch({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STRETCH_STORAGE_KEY,
        stretchCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
