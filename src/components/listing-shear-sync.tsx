"use client";

import { useEffect } from "react";

import { SHEAR_STORAGE_KEY, shearCookieValue } from "@/lib/listing-shear";

/** Copy the cookie shear set into `iss:shear-listing-ids` after a no-JS POST. */
export function SyncShear({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SHEAR_STORAGE_KEY,
        shearCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
