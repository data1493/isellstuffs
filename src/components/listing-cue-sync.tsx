"use client";

import { useEffect } from "react";

import { CUE_STORAGE_KEY, cueCookieValue } from "@/lib/listing-cue";

/** Copy the cookie cue set into `iss:cue-listing-ids` after a no-JS POST. */
export function SyncCue({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        CUE_STORAGE_KEY,
        cueCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
