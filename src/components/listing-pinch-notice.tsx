import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PINCH_COOKIE_NAME,
  PINCH_HISS_LINE,
  PINCH_NOTICE_TITLE,
  PINCH_RADIO_LINE,
  PINCH_STILL_LINE,
  PINCH_TABLE_LINE,
  PINCH_TOTE_LINE,
  isListingPinchOverlay,
  parsePinchListingIds,
} from "@/lib/listing-pinch";
import { listingPinchPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-pinch-it. Reads the cookie only. */
export async function ListingPinchNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parsePinchListingIds(jar.get(PINCH_COOKIE_NAME)?.value);

  if (!isListingPinchOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-pinch-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PINCH_TABLE_LINE}
        title={PINCH_NOTICE_TITLE}
        body={`${PINCH_HISS_LINE} ${PINCH_RADIO_LINE} ${PINCH_STILL_LINE} ${PINCH_TOTE_LINE}`}
      >
        <Link
          href={listingPinchPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The pinch card
        </Link>
      </MallNotice>
    </div>
  );
}
