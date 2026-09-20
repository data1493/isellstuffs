"use client";

import { useEffect } from "react";

import { HOTBAR_STORAGE_KEY, hotbarCookieValue } from "@/lib/listing-hotbar";

/** Copy the cookie hotbar set into `iss:hotbar-listing-ids` after a no-JS POST. */
export function SyncHotbar({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        HOTBAR_STORAGE_KEY,
        hotbarCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
