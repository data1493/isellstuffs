"use client";

import { useEffect } from "react";

import { OPSZ_STORAGE_KEY, opszCookieValue } from "@/lib/listing-opsz";

/** Copy the cookie opsz set into `iss:opsz-listing-ids` after a no-JS POST. */
export function SyncOpsz({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        OPSZ_STORAGE_KEY,
        opszCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
