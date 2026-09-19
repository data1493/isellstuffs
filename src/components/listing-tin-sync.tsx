"use client";

import { useEffect } from "react";

import { TIN_STORAGE_KEY, tinCookieValue } from "@/lib/listing-tin";

/** Copy the cookie tin set into `iss:tin-listing-ids` after a no-JS POST. */
export function SyncTin({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(TIN_STORAGE_KEY, tinCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
