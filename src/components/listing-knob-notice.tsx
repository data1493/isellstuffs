import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  KNOB_COOKIE_NAME,
  KNOB_FITS_LINE,
  KNOB_LID_LINE,
  KNOB_STILL_LINE,
  KNOB_TABLE_LINE,
  KNOB_TIGHTEN_LINE,
  KNOB_TOTE_LINE,
  isListingKnobOverlay,
  parseKnobListingIds,
} from "@/lib/listing-knob";
import { listingKnobPath } from "@/lib/paths";

/** PDP banner when this SKU is taped knob-stays-loose. Does not change the tote. */
export async function ListingKnobNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseKnobListingIds(jar.get(KNOB_COOKIE_NAME)?.value);

  if (!isListingKnobOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-knob-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The knob stays loose"
        title={KNOB_TABLE_LINE}
        body={`${KNOB_TIGHTEN_LINE} ${KNOB_FITS_LINE} ${KNOB_LID_LINE} ${KNOB_STILL_LINE} ${KNOB_TOTE_LINE}`}
      >
        <Link
          href={listingKnobPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The knob card
        </Link>
      </MallNotice>
    </div>
  );
}
