"use client";

import { useEffect } from "react";

import { MASTER_STORAGE_KEY, masterCookieValue } from "@/lib/listing-master";

/** Copy the cookie master set into `iss:master-listing-ids` after a no-JS POST. */
export function SyncMaster({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        MASTER_STORAGE_KEY,
        masterCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
