"use client";

import { useEffect } from "react";

import { TUMBLE_STORAGE_KEY, tumbleCookieValue } from "@/lib/listing-tumble";

/** Copy the cookie tumble set into `iss:tumble-listing-ids` after a no-JS POST. */
export function SyncTumble({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        TUMBLE_STORAGE_KEY,
        tumbleCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
