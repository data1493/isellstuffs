"use client";

import { useEffect } from "react";

import {
  BOOTH_SHELL_STORAGE_KEY,
  mergeBoothShellMaps,
  readBoothShell,
  serializeBoothShell,
  type BoothShellMap,
} from "@/lib/booth-shell";

/** Copy the cookie cork into `iss:booth-shell` after a no-JS tape. */
export function SyncBoothShell({ map }: { map: BoothShellMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothShellMaps(readBoothShell(), map);
      window.localStorage.setItem(
        BOOTH_SHELL_STORAGE_KEY,
        serializeBoothShell(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
