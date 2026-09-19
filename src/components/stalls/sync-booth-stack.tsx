"use client";

import { useEffect } from "react";

import {
  BOOTH_STACK_STORAGE_KEY,
  mergeBoothStackMaps,
  readBoothStack,
  serializeBoothStack,
  type BoothStackMap,
} from "@/lib/booth-stack";

/** Copy the cookie cork into `iss:booth-stack` after a no-JS tape. */
export function SyncBoothStack({ map }: { map: BoothStackMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothStackMaps(readBoothStack(), map);
      window.localStorage.setItem(
        BOOTH_STACK_STORAGE_KEY,
        serializeBoothStack(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
