"use client";

import { useEffect } from "react";

import {
  BOOTH_POSE_STORAGE_KEY,
  mergeBoothPoseMaps,
  readBoothPose,
  serializeBoothPose,
  type BoothPoseMap,
} from "@/lib/booth-pose";

/** Copy the cookie cork into `iss:booth-pose` after a no-JS tape. */
export function SyncBoothPose({ map }: { map: BoothPoseMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothPoseMaps(readBoothPose(), map);
      window.localStorage.setItem(
        BOOTH_POSE_STORAGE_KEY,
        serializeBoothPose(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
