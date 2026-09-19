"use client";

import { useEffect } from "react";

import { LOG_STORAGE_KEY, logCookieValue } from "@/lib/listing-log";

/** Copy the cookie log set into `iss:log-listing-ids` after a no-JS POST. */
export function SyncLog({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(LOG_STORAGE_KEY, logCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
