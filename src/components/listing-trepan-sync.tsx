"use client";

import { useEffect } from "react";

import { TREPAN_STORAGE_KEY, trepanCookieValue } from "@/lib/listing-trepan";

/** Copy the cookie trepan set into `iss:trepan-listing-ids` after a no-JS POST. */
export function SyncTrepan({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        TREPAN_STORAGE_KEY,
        trepanCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
