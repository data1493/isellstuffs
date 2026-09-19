"use client";

import { useEffect } from "react";

import { HINT_STORAGE_KEY, hintCookieValue } from "@/lib/listing-hint";

/** Copy the cookie hint set into `iss:hint-listing-ids` after a no-JS POST. */
export function SyncHint({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(HINT_STORAGE_KEY, hintCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
