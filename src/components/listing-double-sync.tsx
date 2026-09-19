"use client";

import { useEffect } from "react";

import { DOUBLE_STORAGE_KEY, doubleCookieValue } from "@/lib/listing-double";

/** Copy the cookie double set into `iss:double-listing-ids` after a no-JS POST. */
export function SyncDouble({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        DOUBLE_STORAGE_KEY,
        doubleCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
