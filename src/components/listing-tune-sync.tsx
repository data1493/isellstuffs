"use client";

import { useEffect } from "react";

import { TUNE_STORAGE_KEY, tuneCookieValue } from "@/lib/listing-tune";

/** Copy the cookie tune set into `iss:tune-listing-ids` after a no-JS POST. */
export function SyncTune({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        TUNE_STORAGE_KEY,
        tuneCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
