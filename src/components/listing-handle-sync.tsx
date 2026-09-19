"use client";

import { useEffect } from "react";

import { HANDLE_STORAGE_KEY, handleCookieValue } from "@/lib/listing-handle";

/** Copy the cookie handle set into `iss:handle-listing-ids` after a no-JS POST. */
export function SyncHandle({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(HANDLE_STORAGE_KEY, handleCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
