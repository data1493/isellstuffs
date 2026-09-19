"use client";

import { useEffect } from "react";

import { SATURATE_STORAGE_KEY, saturateCookieValue } from "@/lib/listing-saturate";

/** Copy the cookie saturate set into `iss:saturate-listing-ids` after a no-JS POST. */
export function SyncSaturate({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SATURATE_STORAGE_KEY,
        saturateCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
