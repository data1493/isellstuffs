"use client";

import { useEffect } from "react";

import { LED_STORAGE_KEY, ledCookieValue } from "@/lib/listing-led";

/** Copy the cookie led set into `iss:led-listing-ids` after a no-JS POST. */
export function SyncLed({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(LED_STORAGE_KEY, ledCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
