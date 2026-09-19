"use client";

import { useEffect } from "react";

import { BPM_STORAGE_KEY, bpmCookieValue } from "@/lib/listing-bpm";

/** Copy the cookie bpm set into `iss:bpm-listing-ids` after a no-JS POST. */
export function SyncBpm({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(BPM_STORAGE_KEY, bpmCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
