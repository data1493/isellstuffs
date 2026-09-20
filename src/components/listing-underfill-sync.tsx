"use client";

import { useEffect } from "react";

import { UNDERFILL_STORAGE_KEY, underfillCookieValue } from "@/lib/listing-underfill";

/** Copy the cookie underfill set into `iss:underfill-listing-ids` after a no-JS POST. */
export function SyncUnderfill({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        UNDERFILL_STORAGE_KEY,
        underfillCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
