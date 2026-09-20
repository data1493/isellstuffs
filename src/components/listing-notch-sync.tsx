"use client";

import { useEffect } from "react";

import { NOTCH_STORAGE_KEY, notchCookieValue } from "@/lib/listing-notch";

/** Copy the cookie notch set into `iss:notch-listing-ids` after a no-JS POST. */
export function SyncNotch({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        NOTCH_STORAGE_KEY,
        notchCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
