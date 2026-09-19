"use client";

import { useEffect } from "react";

import {
  CONTENTS_STORAGE_KEY,
  contentsCookieValue,
} from "@/lib/listing-contents";

/** Copy the cookie contents set into `iss:contents-listing-ids` after a no-JS POST. */
export function SyncContents({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        CONTENTS_STORAGE_KEY,
        contentsCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
