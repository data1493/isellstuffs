"use client";

import { useEffect } from "react";

import { HICKEY_STORAGE_KEY, hickeyCookieValue } from "@/lib/listing-hickey";

/** Copy the cookie hickey set into `iss:hickey-listing-ids` after a no-JS POST. */
export function SyncHickey({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(HICKEY_STORAGE_KEY, hickeyCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
