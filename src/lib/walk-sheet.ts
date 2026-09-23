/**
 * Saturday morning walk scrap.
 *
 * Reads watched booths, weekend hours, and packed-up flags.
 * Does not write those cookies. Does not rewrite `/watched`,
 * `/sell/hours`, pack-up, `/lot`, or `/sell/taken`.
 */
import { stallById, type Stall } from "@/lib/commerce";
import { parsePackedStallIds } from "@/lib/packed-stall";
import {
  stallPickupNote,
  type StallPickupNote,
} from "@/lib/pickup-display";
import { parseWatchedStallIds } from "@/lib/watched-stalls";
import {
  parseWeekendHours,
  tapedHoursFor,
  type WeekendHoursMap,
} from "@/lib/weekend-hours";

export type WalkStop = {
  stall: Stall;
  pickup: StallPickupNote;
};

export type SaturdayWalk = {
  stops: WalkStop[];
  watchedCount: number;
  packedAwayCount: number;
};

function hoursMapFromRaw(hoursRaw?: string | null): WeekendHoursMap {
  return parseWeekendHours(hoursRaw);
}

export function walkHoursFor(
  stall: Stall,
  hoursMap: WeekendHoursMap,
): StallPickupNote {
  return tapedHoursFor(stall.id, hoursMap) ?? stallPickupNote(stall);
}

/**
 * Watched booths that are still out. Packed tables stay in the car.
 * Missing stall ids are dropped — not a crash.
 */
export function saturdayWalkSheet(input: {
  watchedRaw?: string | null;
  packedRaw?: string | null;
  hoursRaw?: string | null;
}): SaturdayWalk {
  const watchedIds = parseWatchedStallIds(input.watchedRaw);
  const packedIds = new Set(parsePackedStallIds(input.packedRaw));
  const hoursMap = hoursMapFromRaw(input.hoursRaw);

  const stops: WalkStop[] = [];
  let packedAwayCount = 0;

  for (const id of watchedIds) {
    const stall = stallById(id);
    if (!stall) {
      continue;
    }
    if (packedIds.has(stall.id)) {
      packedAwayCount += 1;
      continue;
    }
    stops.push({
      stall,
      pickup: walkHoursFor(stall, hoursMap),
    });
  }

  return {
    stops,
    watchedCount: watchedIds.length,
    packedAwayCount,
  };
}
