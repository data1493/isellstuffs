"use client";

import { useEffect } from "react";

import { RIVET_STORAGE_KEY, rivetCookieValue } from "@/lib/listing-rivet";

/** Copy the cookie rivet set into `iss:rivet-listing-ids` after a no-JS POST. */
export function SyncRivet({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        RIVET_STORAGE_KEY,
        rivetCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
