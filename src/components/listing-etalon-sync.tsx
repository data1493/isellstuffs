"use client";

import { useEffect } from "react";

import {
  ETALON_STORAGE_KEY,
  etalonCookieValue,
} from "@/lib/listing-etalon";

/** Copy the cookie etalon set into `iss:etalon-listing-ids` after a no-JS POST. */
export function SyncEtalon({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        ETALON_STORAGE_KEY,
        etalonCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
