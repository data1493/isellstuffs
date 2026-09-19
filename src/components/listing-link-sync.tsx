"use client";

import { useEffect } from "react";

import { LINK_STORAGE_KEY, linkCookieValue } from "@/lib/listing-link";

/** Copy the cookie link set into `iss:link-listing-ids` after a no-JS POST. */
export function SyncLink({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(LINK_STORAGE_KEY, linkCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
