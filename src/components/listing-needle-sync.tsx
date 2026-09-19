"use client";

import { useEffect } from "react";

import { NEEDLE_STORAGE_KEY, needleCookieValue } from "@/lib/listing-needle";

/** Copy the cookie needle set into `iss:needle-listing-ids` after a no-JS POST. */
export function SyncNeedle({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        NEEDLE_STORAGE_KEY,
        needleCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
