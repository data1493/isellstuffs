"use client";

import { useEffect } from "react";

import { OVERHANG_STORAGE_KEY, overhangCookieValue } from "@/lib/listing-overhang";

/** Copy the cookie overhang set into `iss:overhang-listing-ids` after a no-JS POST. */
export function SyncOverhang({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        OVERHANG_STORAGE_KEY,
        overhangCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
