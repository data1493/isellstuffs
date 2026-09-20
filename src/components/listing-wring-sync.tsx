"use client";

import { useEffect } from "react";

import {
  WRING_STORAGE_KEY,
  wringCookieValue,
} from "@/lib/listing-wring";

/** Copy the cookie wring set into `iss:wring-listing-ids` after a no-JS POST. */
export function SyncWring({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        WRING_STORAGE_KEY,
        wringCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
