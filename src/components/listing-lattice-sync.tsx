"use client";

import { useEffect } from "react";

import { LATTICE_STORAGE_KEY, latticeCookieValue } from "@/lib/listing-lattice";

/** Copy the cookie lattice set into `iss:lattice-listing-ids` after a no-JS POST. */
export function SyncLattice({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        LATTICE_STORAGE_KEY,
        latticeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
