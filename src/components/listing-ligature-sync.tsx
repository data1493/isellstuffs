"use client";

import { useEffect } from "react";

import {
  LIGATURE_STORAGE_KEY,
  ligatureCookieValue,
} from "@/lib/listing-ligature";

/** Copy the cookie ligature set into `iss:ligature-listing-ids` after a no-JS POST. */
export function SyncLigature({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        LIGATURE_STORAGE_KEY,
        ligatureCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
