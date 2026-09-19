"use client";

import { useEffect } from "react";

import { FELL_STORAGE_KEY, fellCookieValue } from "@/lib/listing-fell";

/** Copy the cookie fell set into `iss:fell-listing-ids` after a no-JS POST. */
export function SyncFell({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        FELL_STORAGE_KEY,
        fellCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
