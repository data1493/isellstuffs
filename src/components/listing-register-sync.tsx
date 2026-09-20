"use client";

import { useEffect } from "react";

import { REGISTER_STORAGE_KEY, registerCookieValue } from "@/lib/listing-register";

/** Copy the cookie register set into `iss:register-listing-ids` after a no-JS POST. */
export function SyncRegister({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        REGISTER_STORAGE_KEY,
        registerCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
