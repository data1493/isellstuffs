/**
 * Street sheet for one booth. Tape is prices; this is hours at the curb.
 * Bag this table scoops the tote. Flyer is a paid souvenir. Tag is a 3×5.
 *
 * Reads `@/lib/commerce` stalls + `stallPickupNote` (fixture or weekend
 * overlay). Packed booths have no sign. Does not write hours, pack, tote,
 * scrap, or here-handoff.
 */
import { stallBySlug, type Stall } from "@/lib/commerce";
import { parsePackedStallIds } from "@/lib/packed-stall";
import {
  stallPickupNote,
  type StallPickupNote,
} from "@/lib/pickup-display";
import {
  parseWeekendHours,
  tapedHoursFor,
} from "@/lib/weekend-hours";

export const SIGN_MISSING_COPY = "No sign for that stall.";
export const SIGN_PACKED_COPY = "No sign. This booth packed up.";
export const SIGN_REFUSE = "We do not ship.";
export const SIGN_HAND_LINE =
  "Tape is the price sheet. This is the driveway sign.";
export const SIGN_STREET_LINE =
  "Hours at the curb. Not a paid flyer. Not the table tape.";

export type YardSignKind = "sheet" | "packed" | "missing";

export type YardSignSheet = {
  kind: YardSignKind;
  slug: string;
  stall: Stall | null;
  hours: string;
  place: string;
  note: string;
  refuse: string;
};

export function signHoursFor(
  stall: Stall,
  hoursRaw?: string | null,
): StallPickupNote {
  return tapedHoursFor(stall.id, parseWeekendHours(hoursRaw))
    ?? stallPickupNote(stall);
}

export function yardSignForSlug(
  slug: string,
  input: { packedRaw?: string | null; hoursRaw?: string | null } = {},
): YardSignSheet {
  const stall = stallBySlug(slug);

  if (!stall) {
    return {
      kind: "missing",
      slug,
      stall: null,
      hours: "",
      place: "",
      note: "",
      refuse: SIGN_MISSING_COPY,
    };
  }

  if (parsePackedStallIds(input.packedRaw).includes(stall.id)) {
    return {
      kind: "packed",
      slug,
      stall,
      hours: "",
      place: "",
      note: "",
      refuse: SIGN_PACKED_COPY,
    };
  }

  const pickup = signHoursFor(stall, input.hoursRaw);

  return {
    kind: "sheet",
    slug,
    stall,
    hours: pickup.hours,
    place: pickup.place,
    note: pickup.note,
    refuse: SIGN_REFUSE,
  };
}
