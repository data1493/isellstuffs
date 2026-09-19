import {
  isPhysicalListing,
  type Listing,
  type Stall,
} from "@/lib/commerce";
import { tapedHoursFor } from "@/lib/weekend-hours";

/**
 * Pickup hours for a booth. Hung on stand-in stall ids — not a new
 * Listing / Stall field. Digital listings stay file-focused.
 */
export type StallPickupNote = {
  hours: string;
  place: string;
  note: string;
};

const boothPickups: Record<string, StallPickupNote> = {
  "folding-table-tuesday": {
    hours: "Tuesdays, after lunch until the light goes",
    place: "The driveway. Folding table.",
    note: "Pay the mall, then walk up the drive and take the thing. The lamp stays with this booth until you do. We do not pack or ship.",
  },
  "the-hall-closet": {
    hours: "Weeknights after dinner, Saturday morning",
    place: "The porch by the hall closet",
    note: "Try it on at the door. If the pit stains are honest, it leaves with you. The mall is not a warehouse.",
  },
  "half-working": {
    hours: "Friday evening and Saturday, garage door up",
    place: "The good corner of the garage",
    note: "Press start before you walk. If it goes, it is yours. We do not mail gadgets.",
  },
  "beats-under-the-table": {
    hours: "Late, when the crate is still out",
    place: "Under the table, jewel case in the crate",
    note: "The burned disc is a thing you hold. Take the jewel case. Files from this stall stay in the folder.",
  },
  "sunday-crate": {
    hours: "Sundays, crate open until the records go",
    place: "The crate at the curb",
    note: "Flip Side A at the crate. If it plays, take the sleeve. The mall does not ship vinyl.",
  },
  "the-sink-drawer": {
    hours: "Saturdays, sink-side",
    place: "The kitchen stoop",
    note: "Hold the mug. Feel the chip. Then take it home. No back room, no carrier.",
  },
  "gift-desk": {
    hours: "Desk hours, paper only",
    place: "The gift desk",
    note: "This desk hands codes, not junk. If something you can hold lands here, ask at the desk.",
  },
};

function fallbackPickup(stall: Stall): StallPickupNote {
  return {
    hours: "When the booth is up",
    place: `With ${stall.boothName}`,
    note: "After you pay, arrange the handoff with this booth — driveway, porch, folding table. The mall does not ship.",
  };
}

/** Hours and place for a stall the mall already has. Overlay wins. */
export function stallPickupNote(stall: Stall): StallPickupNote {
  const fixture = boothPickups[stall.id] ?? fallbackPickup(stall);
  return tapedHoursFor(stall.id) ?? fixture;
}

/**
 * Physical listings only. Digital and gift cards stay file- or desk-focused.
 */
export function physicalPickupNote(
  listing: Listing,
  stall: Stall | undefined,
): StallPickupNote | null {
  if (!isPhysicalListing(listing) || !stall) {
    return null;
  }
  return stallPickupNote(stall);
}
