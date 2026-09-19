"use client";

import { useEffect } from "react";

import { BOX_STORAGE_KEY, boxCookieValue } from "@/lib/listing-box";

/** Copy the cookie box set into `iss:box-listing-ids` after a no-JS POST. */
export function SyncBox({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(BOX_STORAGE_KEY, boxCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
