"use client";

import { useEffect } from "react";

import { GRIDFIT_STORAGE_KEY, gridfitCookieValue } from "@/lib/listing-gridfit";

/** Copy the cookie gridfit set into `iss:gridfit-listing-ids` after a no-JS POST. */
export function SyncGridfit({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GRIDFIT_STORAGE_KEY,
        gridfitCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
