"use client";

import { useEffect } from "react";

import { RECASE_STORAGE_KEY, recaseCookieValue } from "@/lib/listing-recase";

/** Copy the cookie recase set into `iss:recase-listing-ids` after a no-JS POST. */
export function SyncRecase({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        RECASE_STORAGE_KEY,
        recaseCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
