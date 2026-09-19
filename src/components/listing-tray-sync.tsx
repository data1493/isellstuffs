"use client";

import { useEffect } from "react";

import { TRAY_STORAGE_KEY, trayCookieValue } from "@/lib/listing-tray";

/** Copy the cookie tray set into `iss:tray-listing-ids` after a no-JS POST. */
export function SyncTray({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(TRAY_STORAGE_KEY, trayCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
