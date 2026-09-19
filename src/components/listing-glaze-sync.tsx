"use client";

import { useEffect } from "react";

import { GLAZE_STORAGE_KEY, glazeCookieValue } from "@/lib/listing-glaze";

/** Copy the cookie glaze set into `iss:glaze-listing-ids` after a no-JS POST. */
export function SyncGlaze({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GLAZE_STORAGE_KEY,
        glazeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
