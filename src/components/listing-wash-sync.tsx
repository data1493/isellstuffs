"use client";

import { useEffect } from "react";

import { WASH_STORAGE_KEY, washCookieValue } from "@/lib/listing-wash";

/** Copy the cookie wash set into `iss:wash-listing-ids` after a no-JS POST. */
export function SyncWash({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        WASH_STORAGE_KEY,
        washCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
