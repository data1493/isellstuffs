"use client";

import { useEffect } from "react";

import { ISRC_STORAGE_KEY, isrcCookieValue } from "@/lib/listing-isrc";

/** Copy the cookie isrc set into `iss:isrc-listing-ids` after a no-JS POST. */
export function SyncIsrc({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        ISRC_STORAGE_KEY,
        isrcCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
