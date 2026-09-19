"use client";

import { useEffect } from "react";

import { LOOP_STORAGE_KEY, loopCookieValue } from "@/lib/listing-loop";

/** Copy the cookie loop set into `iss:loop-listing-ids` after a no-JS POST. */
export function SyncLoop({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        LOOP_STORAGE_KEY,
        loopCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
