"use client";

import { useEffect } from "react";

import {
  SINE_STORAGE_KEY,
  sineCookieValue,
} from "@/lib/listing-sine";

/** Copy the cookie sine set into `iss:sine-listing-ids` after a no-JS POST. */
export function SyncSine({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SINE_STORAGE_KEY,
        sineCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
