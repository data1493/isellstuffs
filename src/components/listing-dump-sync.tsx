"use client";

import { useEffect } from "react";

import { DUMP_STORAGE_KEY, dumpCookieValue } from "@/lib/listing-dump";

/** Copy the cookie dump set into `iss:dump-listing-ids` after a no-JS POST. */
export function SyncDump({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(DUMP_STORAGE_KEY, dumpCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
