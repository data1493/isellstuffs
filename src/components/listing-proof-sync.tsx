"use client";

import { useEffect } from "react";

import { PROOF_STORAGE_KEY, proofCookieValue } from "@/lib/listing-proof";

/** Copy the cookie proof set into `iss:proof-listing-ids` after a no-JS POST. */
export function SyncProof({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PROOF_STORAGE_KEY,
        proofCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
