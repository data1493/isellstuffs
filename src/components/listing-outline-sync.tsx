"use client";

import { useEffect } from "react";

import {
  OUTLINE_STORAGE_KEY,
  outlineCookieValue,
} from "@/lib/listing-outline";

/** Copy the cookie outline set into `iss:outline-listing-ids` after a no-JS POST. */
export function SyncOutline({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        OUTLINE_STORAGE_KEY,
        outlineCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
