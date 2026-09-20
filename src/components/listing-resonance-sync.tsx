"use client";

import { useEffect } from "react";

import {
  RESONANCE_STORAGE_KEY,
  resonanceCookieValue,
} from "@/lib/listing-resonance";

/** Copy the cookie resonance set into `iss:resonance-listing-ids` after a no-JS POST. */
export function SyncResonance({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        RESONANCE_STORAGE_KEY,
        resonanceCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
