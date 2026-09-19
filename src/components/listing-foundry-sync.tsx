"use client";

import { useEffect } from "react";

import {
  FOUNDRY_STORAGE_KEY,
  foundryCookieValue,
} from "@/lib/listing-foundry";

/** Copy the cookie foundry set into `iss:foundry-listing-ids` after a no-JS POST. */
export function SyncFoundry({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        FOUNDRY_STORAGE_KEY,
        foundryCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
