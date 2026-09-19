"use client";

import { useEffect } from "react";

import { COIL_STORAGE_KEY, coilCookieValue } from "@/lib/listing-coil";

/** Copy the cookie coil set into `iss:coil-listing-ids` after a no-JS POST. */
export function SyncCoil({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(COIL_STORAGE_KEY, coilCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
