import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SPOTFACE_COOKIE_NAME,
  SPOTFACE_LID_LINE,
  SPOTFACE_NOTICE_TITLE,
  SPOTFACE_POT_LINE,
  SPOTFACE_STILL_LINE,
  SPOTFACE_TABLE_LINE,
  SPOTFACE_TOTE_LINE,
  isListingSpotfaceOverlay,
  parseSpotfaceListingIds,
} from "@/lib/listing-spotface";
import { listingSpotfacePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-spotface-it. Reads the cookie only. */
export async function ListingSpotfaceNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseSpotfaceListingIds(jar.get(SPOTFACE_COOKIE_NAME)?.value);

  if (!isListingSpotfaceOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-spotface-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SPOTFACE_TABLE_LINE}
        title={SPOTFACE_NOTICE_TITLE}
        body={`${SPOTFACE_LID_LINE} ${SPOTFACE_POT_LINE} ${SPOTFACE_STILL_LINE} ${SPOTFACE_TOTE_LINE}`}
      >
        <Link
          href={listingSpotfacePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The spotface card
        </Link>
      </MallNotice>
    </div>
  );
}
