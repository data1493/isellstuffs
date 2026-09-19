"use client";

import { useEffect } from "react";

import { RIP_STORAGE_KEY, ripCookieValue } from "@/lib/listing-rip";

/** Copy the cookie rip set into `iss:rip-listing-ids` after a no-JS POST. */
export function SyncRip({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(RIP_STORAGE_KEY, ripCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
