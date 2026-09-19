"use client";

import { useEffect } from "react";

import { INK_STORAGE_KEY, inkCookieValue } from "@/lib/listing-ink";

/** Copy the cookie ink set into `iss:ink-listing-ids` after a no-JS POST. */
export function SyncInk({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(INK_STORAGE_KEY, inkCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
