"use client";

import { useEffect } from "react";

import { WRONG_STORAGE_KEY, wrongCookieValue } from "@/lib/listing-wrong";

/** Copy the cookie wrong set into `iss:wrong-listing-ids` after a no-JS POST. */
export function SyncWrong({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        WRONG_STORAGE_KEY,
        wrongCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
