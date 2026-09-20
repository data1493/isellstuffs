"use client";

import { useEffect } from "react";

import { DETUNE_STORAGE_KEY, detuneCookieValue } from "@/lib/listing-detune";

/** Copy the cookie detune set into `iss:detune-listing-ids` after a no-JS POST. */
export function SyncDetune({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(DETUNE_STORAGE_KEY, detuneCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
