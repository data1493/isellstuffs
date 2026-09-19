"use client";

import { useEffect } from "react";

import { ICONS_STORAGE_KEY, iconsCookieValue } from "@/lib/listing-icons";

/** Copy the cookie icons set into `iss:icons-listing-ids` after a no-JS POST. */
export function SyncIcons({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        ICONS_STORAGE_KEY,
        iconsCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
