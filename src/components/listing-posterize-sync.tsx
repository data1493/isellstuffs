"use client";

import { useEffect } from "react";

import { POSTERIZE_STORAGE_KEY, posterizeCookieValue } from "@/lib/listing-posterize";

/** Copy the cookie posterize set into `iss:posterize-listing-ids` after a no-JS POST. */
export function SyncPosterize({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        POSTERIZE_STORAGE_KEY,
        posterizeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
