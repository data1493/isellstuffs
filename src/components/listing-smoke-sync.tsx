"use client";

import { useEffect } from "react";

import { SMOKE_STORAGE_KEY, smokeCookieValue } from "@/lib/listing-smoke";

/** Copy the cookie smoke set into `iss:smoke-listing-ids` after a no-JS POST. */
export function SyncSmoke({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SMOKE_STORAGE_KEY,
        smokeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
