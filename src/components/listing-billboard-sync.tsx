"use client";

import { useEffect } from "react";

import { BILLBOARD_STORAGE_KEY, billboardCookieValue } from "@/lib/listing-billboard";

/** Copy the cookie billboard set into `iss:billboard-listing-ids` after a no-JS POST. */
export function SyncBillboard({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        BILLBOARD_STORAGE_KEY,
        billboardCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
