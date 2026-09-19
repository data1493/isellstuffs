"use client";

import { useEffect } from "react";

import {
  CONTRAST_STORAGE_KEY,
  contrastCookieValue,
} from "@/lib/listing-contrast";

/** Copy the cookie contrast set into `iss:contrast-listing-ids` after a no-JS POST. */
export function SyncContrast({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        CONTRAST_STORAGE_KEY,
        contrastCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
