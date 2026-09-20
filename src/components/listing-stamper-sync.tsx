"use client";

import { useEffect } from "react";

import { STAMPER_STORAGE_KEY, stamperCookieValue } from "@/lib/listing-stamper";

/** Copy the cookie stamper set into `iss:stamper-listing-ids` after a no-JS POST. */
export function SyncStamper({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STAMPER_STORAGE_KEY,
        stamperCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
