"use client";

import { useEffect } from "react";

import { OPBD_STORAGE_KEY, opbdCookieValue } from "@/lib/listing-opbd";

/** Copy the cookie opbd set into `iss:opbd-listing-ids` after a no-JS POST. */
export function SyncOpbd({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        OPBD_STORAGE_KEY,
        opbdCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
