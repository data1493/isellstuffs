"use client";

import { useEffect } from "react";

import { WELD_STORAGE_KEY, weldCookieValue } from "@/lib/listing-weld";

/** Copy the cookie weld set into `iss:weld-listing-ids` after a no-JS POST. */
export function SyncWeld({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(WELD_STORAGE_KEY, weldCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
