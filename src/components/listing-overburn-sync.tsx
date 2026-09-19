"use client";

import { useEffect } from "react";

import {
  OVERBURN_STORAGE_KEY,
  overburnCookieValue,
} from "@/lib/listing-overburn";

/** Copy the cookie overburn set into `iss:overburn-listing-ids` after a no-JS POST. */
export function SyncOverburn({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        OVERBURN_STORAGE_KEY,
        overburnCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
