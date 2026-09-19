"use client";

import { useEffect } from "react";

import {
  VARIABLE_STORAGE_KEY,
  variableCookieValue,
} from "@/lib/listing-variable";

/** Copy the cookie variable set into `iss:variable-listing-ids` after a no-JS POST. */
export function SyncVariable({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        VARIABLE_STORAGE_KEY,
        variableCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
