"use client";

import { useEffect } from "react";

import { WARM_STORAGE_KEY, warmCookieValue } from "@/lib/listing-warm";

/** Copy the cookie warm set into `iss:warm-listing-ids` after a no-JS POST. */
export function SyncWarm({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(WARM_STORAGE_KEY, warmCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
