"use client";

import { useEffect } from "react";

import {
  BOOTH_BONE_STORAGE_KEY,
  mergeBoothBoneMaps,
  readBoothBone,
  serializeBoothBone,
  type BoothBoneMap,
} from "@/lib/booth-bone";

/** Copy the cookie cork into `iss:booth-bone` after a no-JS tape. */
export function SyncBoothBone({ map }: { map: BoothBoneMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothBoneMaps(readBoothBone(), map);
      window.localStorage.setItem(
        BOOTH_BONE_STORAGE_KEY,
        serializeBoothBone(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
