"use client";

import { useEffect } from "react";

import { GROMMET_STORAGE_KEY, grommetCookieValue } from "@/lib/listing-grommet";

/** Copy the cookie grommet set into `iss:grommet-listing-ids` after a no-JS POST. */
export function SyncGrommet({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GROMMET_STORAGE_KEY,
        grommetCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
