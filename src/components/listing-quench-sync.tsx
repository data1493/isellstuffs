"use client";

import { useEffect } from "react";

import { QUENCH_STORAGE_KEY, quenchCookieValue } from "@/lib/listing-quench";

/** Copy the cookie quench set into `iss:quench-listing-ids` after a no-JS POST. */
export function SyncQuench({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        QUENCH_STORAGE_KEY,
        quenchCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
