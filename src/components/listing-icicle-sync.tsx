"use client";

import { useEffect } from "react";

import { ICICLE_STORAGE_KEY, icicleCookieValue } from "@/lib/listing-icicle";

/** Copy the cookie icicle set into `iss:icicle-listing-ids` after a no-JS POST. */
export function SyncIcicle({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        ICICLE_STORAGE_KEY,
        icicleCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
