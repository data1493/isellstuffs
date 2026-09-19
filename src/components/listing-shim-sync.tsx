"use client";

import { useEffect } from "react";

import { SHIM_STORAGE_KEY, shimCookieValue } from "@/lib/listing-shim";

/** Copy the cookie shim set into `iss:shim-listing-ids` after a no-JS POST. */
export function SyncShim({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(SHIM_STORAGE_KEY, shimCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
