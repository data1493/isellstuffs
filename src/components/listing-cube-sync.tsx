"use client";

import { useEffect } from "react";

import { CUBE_STORAGE_KEY, cubeCookieValue } from "@/lib/listing-cube";

/** Copy the cookie cube set into `iss:cube-listing-ids` after a no-JS POST. */
export function SyncCube({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        CUBE_STORAGE_KEY,
        cubeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
