"use client";

import { useEffect } from "react";

import {
  BOOTH_FILM_STORAGE_KEY,
  mergeBoothFilmMaps,
  readBoothFilm,
  serializeBoothFilm,
  type BoothFilmMap,
} from "@/lib/booth-film";

/** Copy the cookie cork into `iss:booth-film` after a no-JS tape. */
export function SyncBoothFilm({ map }: { map: BoothFilmMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothFilmMaps(readBoothFilm(), map);
      window.localStorage.setItem(
        BOOTH_FILM_STORAGE_KEY,
        serializeBoothFilm(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
