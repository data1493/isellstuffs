"use client";

import { useEffect } from "react";

import { GLUE_STORAGE_KEY, glueCookieValue } from "@/lib/listing-glue";

/** Copy the cookie glue set into `iss:glue-listing-ids` after a no-JS POST. */
export function SyncGlue({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(GLUE_STORAGE_KEY, glueCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
