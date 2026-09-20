"use client";

import { useEffect } from "react";

import { RUMBLE_STORAGE_KEY, rumbleCookieValue } from "@/lib/listing-rumble";

/** Copy the cookie rumble set into `iss:rumble-listing-ids` after a no-JS POST. */
export function SyncRumble({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        RUMBLE_STORAGE_KEY,
        rumbleCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
