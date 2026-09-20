"use client";

import { useEffect } from "react";

import { HMTX_STORAGE_KEY, hmtxCookieValue } from "@/lib/listing-hmtx";

/** Copy the cookie hmtx set into `iss:hmtx-listing-ids` after a no-JS POST. */
export function SyncHmtx({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        HMTX_STORAGE_KEY,
        hmtxCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
