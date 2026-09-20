import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  NOTCH_COOKIE_NAME,
  NOTCH_NOTICE_TITLE,
  NOTCH_PITS_LINE,
  NOTCH_SMELL_LINE,
  NOTCH_STILL_LINE,
  NOTCH_TABLE_LINE,
  NOTCH_TOTE_LINE,
  isListingNotchOverlay,
  parseNotchListingIds,
} from "@/lib/listing-notch";
import { listingNotchPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-notch-it. Reads the cookie only. */
export async function ListingNotchNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseNotchListingIds(jar.get(NOTCH_COOKIE_NAME)?.value);

  if (!isListingNotchOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-notch-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={NOTCH_TABLE_LINE}
        title={NOTCH_NOTICE_TITLE}
        body={`${NOTCH_PITS_LINE} ${NOTCH_SMELL_LINE} ${NOTCH_STILL_LINE} ${NOTCH_TOTE_LINE}`}
      >
        <Link
          href={listingNotchPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The notch card
        </Link>
      </MallNotice>
    </div>
  );
}
