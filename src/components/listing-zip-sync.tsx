"use client";

import { useEffect } from "react";

import { ZIP_STORAGE_KEY, zipCookieValue } from "@/lib/listing-zip";

/** Copy the cookie zip set into `iss:zip-listing-ids` after a no-JS POST. */
export function SyncZip({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(ZIP_STORAGE_KEY, zipCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
