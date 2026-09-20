"use client";

import { useEffect } from "react";

import { DAM_STORAGE_KEY, damCookieValue } from "@/lib/listing-dam";

/** Copy the cookie dam set into `iss:dam-listing-ids` after a no-JS POST. */
export function SyncDam({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(DAM_STORAGE_KEY, damCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
