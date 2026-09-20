"use client";

import { useEffect } from "react";

import { NABS_STORAGE_KEY, nabsCookieValue } from "@/lib/listing-nabs";

/** Copy the cookie nabs set into `iss:nabs-listing-ids` after a no-JS POST. */
export function SyncNabs({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        NABS_STORAGE_KEY,
        nabsCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
