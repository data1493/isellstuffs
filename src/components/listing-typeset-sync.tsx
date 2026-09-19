"use client";

import { useEffect } from "react";

import { TYPESET_STORAGE_KEY, typesetCookieValue } from "@/lib/listing-typeset";

/** Copy the cookie typeset set into `iss:typeset-listing-ids` after a no-JS POST. */
export function SyncTypeset({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        TYPESET_STORAGE_KEY,
        typesetCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
