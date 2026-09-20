"use client";

import { useEffect } from "react";

import {
  COUNTERSINK_STORAGE_KEY,
  countersinkCookieValue,
} from "@/lib/listing-countersink";

/** Copy the cookie countersink set into `iss:countersink-listing-ids` after a no-JS POST. */
export function SyncCountersink({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        COUNTERSINK_STORAGE_KEY,
        countersinkCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
