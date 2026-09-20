"use client";

import { useEffect } from "react";

import { PINK_STORAGE_KEY, pinkCookieValue } from "@/lib/listing-pink";

/** Copy the cookie pink set into `iss:pink-listing-ids` after a no-JS POST. */
export function SyncPink({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PINK_STORAGE_KEY,
        pinkCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
