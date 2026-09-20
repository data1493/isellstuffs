"use client";

import { useEffect } from "react";

import { BRAZE_STORAGE_KEY, brazeCookieValue } from "@/lib/listing-braze";

/** Copy the cookie braze set into `iss:braze-listing-ids` after a no-JS POST. */
export function SyncBraze({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        BRAZE_STORAGE_KEY,
        brazeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
