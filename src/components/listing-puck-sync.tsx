"use client";

import { useEffect } from "react";

import { PUCK_STORAGE_KEY, puckCookieValue } from "@/lib/listing-puck";

/** Copy the cookie puck set into `iss:puck-listing-ids` after a no-JS POST. */
export function SyncPuck({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PUCK_STORAGE_KEY,
        puckCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
