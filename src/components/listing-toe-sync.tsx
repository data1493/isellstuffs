"use client";

import { useEffect } from "react";

import { TOE_STORAGE_KEY, toeCookieValue } from "@/lib/listing-toe";

/** Copy the cookie peel set into `iss:toe-listing-ids` after a no-JS POST. */
export function SyncToe({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(TOE_STORAGE_KEY, toeCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
