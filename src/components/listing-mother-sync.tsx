"use client";

import { useEffect } from "react";

import { MOTHER_STORAGE_KEY, motherCookieValue } from "@/lib/listing-mother";

/** Copy the cookie mother set into `iss:mother-listing-ids` after a no-JS POST. */
export function SyncMother({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        MOTHER_STORAGE_KEY,
        motherCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
