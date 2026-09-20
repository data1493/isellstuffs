"use client";

import { useEffect } from "react";

import { FILLET_STORAGE_KEY, filletCookieValue } from "@/lib/listing-fillet";

/** Copy the cookie fillet set into `iss:fillet-listing-ids` after a no-JS POST. */
export function SyncFillet({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        FILLET_STORAGE_KEY,
        filletCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
