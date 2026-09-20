"use client";

import { useEffect } from "react";

import { EDGE_STORAGE_KEY, edgeCookieValue } from "@/lib/listing-edge";

/** Copy the cookie edge set into `iss:edge-listing-ids` after a no-JS POST. */
export function SyncEdge({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(EDGE_STORAGE_KEY, edgeCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
