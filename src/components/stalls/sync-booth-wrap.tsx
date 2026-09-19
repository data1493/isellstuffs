"use client";

import { useEffect } from "react";

import {
  BOOTH_WRAP_STORAGE_KEY,
  mergeBoothWrapMaps,
  readBoothWrap,
  serializeBoothWrap,
  type BoothWrapMap,
} from "@/lib/booth-wrap";

/** Copy the cookie cork into `iss:booth-wrap` after a no-JS tape. */
export function SyncBoothWrap({ map }: { map: BoothWrapMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothWrapMaps(readBoothWrap(), map);
      window.localStorage.setItem(
        BOOTH_WRAP_STORAGE_KEY,
        serializeBoothWrap(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
