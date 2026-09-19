"use client";

import { useEffect } from "react";

import { STRAP_STORAGE_KEY, strapCookieValue } from "@/lib/listing-strap";

/** Copy the cookie strap set into `iss:strap-listing-ids` after a no-JS POST. */
export function SyncStrap({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STRAP_STORAGE_KEY,
        strapCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
