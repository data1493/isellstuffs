"use client";

import { useEffect } from "react";

import { DEOX_STORAGE_KEY, deoxCookieValue } from "@/lib/listing-deox";

/** Copy the cookie deox set into `iss:deox-listing-ids` after a no-JS POST. */
export function SyncDeox({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(DEOX_STORAGE_KEY, deoxCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
