"use client";

import { useEffect } from "react";

import {
  ANTISTAT_STORAGE_KEY,
  antistatCookieValue,
} from "@/lib/listing-antistat";

/** Copy the cookie antistat set into `iss:antistat-listing-ids` after a no-JS POST. */
export function SyncAntistat({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        ANTISTAT_STORAGE_KEY,
        antistatCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
