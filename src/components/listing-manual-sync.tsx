"use client";

import { useEffect } from "react";

import { MANUAL_STORAGE_KEY, manualCookieValue } from "@/lib/listing-manual";

/** Copy the cookie manual set into `iss:manual-listing-ids` after a no-JS POST. */
export function SyncManual({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(MANUAL_STORAGE_KEY, manualCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
