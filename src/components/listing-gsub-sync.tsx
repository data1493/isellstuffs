"use client";

import { useEffect } from "react";

import { GSUB_STORAGE_KEY, gsubCookieValue } from "@/lib/listing-gsub";

/** Copy the cookie gsub set into `iss:gsub-listing-ids` after a no-JS POST. */
export function SyncGsub({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GSUB_STORAGE_KEY,
        gsubCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
