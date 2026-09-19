"use client";

import { useEffect } from "react";

import {
  SCALE_STORAGE_KEY,
  scaleCookieValue,
} from "@/lib/listing-scale";

/** Copy the cookie scale set into `iss:scale-listing-ids` after a no-JS POST. */
export function SyncScale({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SCALE_STORAGE_KEY,
        scaleCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
