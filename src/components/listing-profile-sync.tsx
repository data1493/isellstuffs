"use client";

import { useEffect } from "react";

import { PROFILE_STORAGE_KEY, profileCookieValue } from "@/lib/listing-profile";

/** Copy the cookie profile set into `iss:profile-listing-ids` after a no-JS POST. */
export function SyncProfile({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, profileCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
