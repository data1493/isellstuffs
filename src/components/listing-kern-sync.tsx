"use client";

import { useEffect } from "react";

import { KERN_STORAGE_KEY, kernCookieValue } from "@/lib/listing-kern";

/** Copy the cookie kern set into `iss:kern-listing-ids` after a no-JS POST. */
export function SyncKern({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(KERN_STORAGE_KEY, kernCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
