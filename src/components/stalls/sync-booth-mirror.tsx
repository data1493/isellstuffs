"use client";

import { useEffect } from "react";

import {
  BOOTH_MIRROR_STORAGE_KEY,
  mergeBoothMirrorMaps,
  readBoothMirror,
  serializeBoothMirror,
  type BoothMirrorMap,
} from "@/lib/booth-mirror";

/** Copy the cookie cork into `iss:booth-mirror` after a no-JS tape. */
export function SyncBoothMirror({ map }: { map: BoothMirrorMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothMirrorMaps(readBoothMirror(), map);
      window.localStorage.setItem(
        BOOTH_MIRROR_STORAGE_KEY,
        serializeBoothMirror(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
