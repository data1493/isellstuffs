"use client";

import { useEffect } from "react";

import { CLIP_STORAGE_KEY, clipCookieValue } from "@/lib/listing-clip";

/** Copy the cookie clip set into `iss:clip-listing-ids` after a no-JS POST. */
export function SyncClip({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        CLIP_STORAGE_KEY,
        clipCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
