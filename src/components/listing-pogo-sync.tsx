"use client";

import { useEffect } from "react";

import { POGO_STORAGE_KEY, pogoCookieValue } from "@/lib/listing-pogo";

/** Copy the cookie pogo set into `iss:pogo-listing-ids` after a no-JS POST. */
export function SyncPogo({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        POGO_STORAGE_KEY,
        pogoCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
