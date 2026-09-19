"use client";

import { useEffect } from "react";

import { GATE_STORAGE_KEY, gateCookieValue } from "@/lib/listing-gate";

/** Copy the cookie gate set into `iss:gate-listing-ids` after a no-JS POST. */
export function SyncGate({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GATE_STORAGE_KEY,
        gateCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
