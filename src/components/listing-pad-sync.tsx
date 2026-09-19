"use client";

import { useEffect } from "react";

import { PAD_STORAGE_KEY, padCookieValue } from "@/lib/listing-pad";

/** Copy the cookie pad set into `iss:pad-listing-ids` after a no-JS POST. */
export function SyncPad({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(PAD_STORAGE_KEY, padCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
