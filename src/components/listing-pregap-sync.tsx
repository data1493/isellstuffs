"use client";

import { useEffect } from "react";

import { PREGAP_STORAGE_KEY, pregapCookieValue } from "@/lib/listing-pregap";

/** Copy the cookie pregap set into `iss:pregap-listing-ids` after a no-JS POST. */
export function SyncPregap({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PREGAP_STORAGE_KEY,
        pregapCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
