"use client";

import { useEffect } from "react";

import { WARP_STORAGE_KEY, warpCookieValue } from "@/lib/listing-warp";

/** Copy the cookie warp set into `iss:warp-listing-ids` after a no-JS POST. */
export function SyncWarp({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(WARP_STORAGE_KEY, warpCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
