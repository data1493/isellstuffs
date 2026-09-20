"use client";

import { useEffect } from "react";

import { DESPECKLE_STORAGE_KEY, despeckleCookieValue } from "@/lib/listing-despeckle";

/** Copy the cookie despeckle set into `iss:despeckle-listing-ids` after a no-JS POST. */
export function SyncDespeckle({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        DESPECKLE_STORAGE_KEY,
        despeckleCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
