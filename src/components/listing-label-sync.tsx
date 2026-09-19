"use client";

import { useEffect } from "react";

import { LABEL_STORAGE_KEY, labelCookieValue } from "@/lib/listing-label";

/** Copy the cookie label set into `iss:label-listing-ids` after a no-JS POST. */
export function SyncLabel({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(LABEL_STORAGE_KEY, labelCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
