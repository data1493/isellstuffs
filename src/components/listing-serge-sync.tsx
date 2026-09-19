"use client";

import { useEffect } from "react";

import { SERGE_STORAGE_KEY, sergeCookieValue } from "@/lib/listing-serge";

/** Copy the cookie serge set into `iss:serge-listing-ids` after a no-JS POST. */
export function SyncSerge({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SERGE_STORAGE_KEY,
        sergeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
