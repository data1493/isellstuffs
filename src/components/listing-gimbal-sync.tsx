"use client";

import { useEffect } from "react";

import { GIMBAL_STORAGE_KEY, gimbalCookieValue } from "@/lib/listing-gimbal";

/** Copy the cookie gimbal set into `iss:gimbal-listing-ids` after a no-JS POST. */
export function SyncGimbal({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GIMBAL_STORAGE_KEY,
        gimbalCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
