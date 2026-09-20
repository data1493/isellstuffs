"use client";

import { useEffect } from "react";

import { TORQUE_STORAGE_KEY, torqueCookieValue } from "@/lib/listing-torque";

/** Copy the cookie torque set into `iss:torque-listing-ids` after a no-JS POST. */
export function SyncTorque({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        TORQUE_STORAGE_KEY,
        torqueCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
