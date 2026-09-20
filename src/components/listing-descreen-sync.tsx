"use client";

import { useEffect } from "react";

import { DESCREEN_STORAGE_KEY, descreenCookieValue } from "@/lib/listing-descreen";

/** Copy the cookie descreen set into `iss:descreen-listing-ids` after a no-JS POST. */
export function SyncDescreen({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        DESCREEN_STORAGE_KEY,
        descreenCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
