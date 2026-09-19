"use client";

import { useEffect } from "react";

import { POLISH_STORAGE_KEY, polishCookieValue } from "@/lib/listing-polish";

/** Copy the cookie polish set into `iss:polish-listing-ids` after a no-JS POST. */
export function SyncPolish({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        POLISH_STORAGE_KEY,
        polishCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
