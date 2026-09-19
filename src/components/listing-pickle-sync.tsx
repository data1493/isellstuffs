"use client";

import { useEffect } from "react";

import { PICKLE_STORAGE_KEY, pickleCookieValue } from "@/lib/listing-pickle";

/** Copy the cookie pickle set into `iss:pickle-listing-ids` after a no-JS POST. */
export function SyncPickle({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PICKLE_STORAGE_KEY,
        pickleCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
