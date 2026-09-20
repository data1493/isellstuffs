"use client";

import { useEffect } from "react";

import { DARN_STORAGE_KEY, darnCookieValue } from "@/lib/listing-darn";

/** Copy the cookie darn set into `iss:darn-listing-ids` after a no-JS POST. */
export function SyncDarn({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        DARN_STORAGE_KEY,
        darnCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
