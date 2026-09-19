"use client";

import { useEffect } from "react";

import { RIGHTS_STORAGE_KEY, rightsCookieValue } from "@/lib/listing-rights";

/** Copy the cookie rights set into `iss:rights-listing-ids` after a no-JS POST. */
export function SyncRights({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        RIGHTS_STORAGE_KEY,
        rightsCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
