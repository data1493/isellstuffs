"use client";

import { useEffect } from "react";

import {
  BOOTH_CLAIM_STORAGE_KEY,
  mergeBoothClaimMaps,
  readBoothClaim,
  serializeBoothClaim,
  type BoothClaimMap,
} from "@/lib/booth-claim";

/** Copy the cookie cork into `iss:booth-claim` after a no-JS tape. */
export function SyncBoothClaim({ map }: { map: BoothClaimMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothClaimMaps(readBoothClaim(), map);
      window.localStorage.setItem(
        BOOTH_CLAIM_STORAGE_KEY,
        serializeBoothClaim(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
