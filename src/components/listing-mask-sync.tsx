"use client";

import { useEffect } from "react";

import { MASK_STORAGE_KEY, maskCookieValue } from "@/lib/listing-mask";

/** Copy the cookie mask set into `iss:mask-listing-ids` after a no-JS POST. */
export function SyncMask({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        MASK_STORAGE_KEY,
        maskCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
