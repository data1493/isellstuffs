"use client";

import { useEffect } from "react";

import {
  PRUSSIAN_STORAGE_KEY,
  prussianCookieValue,
} from "@/lib/listing-prussian";

/** Copy the cookie prussian set into `iss:prussian-listing-ids` after a no-JS POST. */
export function SyncPrussian({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PRUSSIAN_STORAGE_KEY,
        prussianCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
