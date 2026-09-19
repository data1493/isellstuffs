"use client";

import { useEffect } from "react";

import { DONGLE_STORAGE_KEY, dongleCookieValue } from "@/lib/listing-dongle";

/** Copy the cookie dongle set into `iss:dongle-listing-ids` after a no-JS POST. */
export function SyncDongle({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(DONGLE_STORAGE_KEY, dongleCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
