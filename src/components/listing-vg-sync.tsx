"use client";

import { useEffect } from "react";

import { VG_STORAGE_KEY, vgCookieValue } from "@/lib/listing-vg";

/** Copy the cookie vg set into `iss:vg-listing-ids` after a no-JS POST. */
export function SyncVg({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(VG_STORAGE_KEY, vgCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
