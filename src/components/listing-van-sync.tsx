"use client";

import { useEffect } from "react";

import { VAN_STORAGE_KEY, vanCookieValue } from "@/lib/van-restock";

/** Copy the cookie van set into `iss:van-listing-ids` after a no-JS POST. */
export function SyncVan({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(VAN_STORAGE_KEY, vanCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
