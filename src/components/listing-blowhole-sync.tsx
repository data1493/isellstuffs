"use client";

import { useEffect } from "react";

import { BLOWHOLE_STORAGE_KEY, blowholeCookieValue } from "@/lib/listing-blowhole";

/** Copy the cookie blowhole set into `iss:blowhole-listing-ids` after a no-JS POST. */
export function SyncBlowhole({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        BLOWHOLE_STORAGE_KEY,
        blowholeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
