"use client";

import { useEffect } from "react";

import { PINCH_STORAGE_KEY, pinchCookieValue } from "@/lib/listing-pinch";

/** Copy the cookie pinch set into `iss:pinch-listing-ids` after a no-JS POST. */
export function SyncPinch({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PINCH_STORAGE_KEY,
        pinchCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
