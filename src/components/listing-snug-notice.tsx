import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SNUG_COOKIE_NAME,
  SNUG_LID_LINE,
  SNUG_NOTICE_TITLE,
  SNUG_STILL_LINE,
  SNUG_TABLE_LINE,
  SNUG_TOTE_LINE,
  SNUG_WIGGLE_LINE,
  isListingSnugOverlay,
  parseSnugListingIds,
} from "@/lib/listing-snug";
import { listingSnugPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-snug-it. Reads the cookie only. */
export async function ListingSnugNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseSnugListingIds(jar.get(SNUG_COOKIE_NAME)?.value);

  if (!isListingSnugOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-snug-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SNUG_TABLE_LINE}
        title={SNUG_NOTICE_TITLE}
        body={`${SNUG_WIGGLE_LINE} ${SNUG_LID_LINE} ${SNUG_STILL_LINE} ${SNUG_TOTE_LINE}`}
      >
        <Link
          href={listingSnugPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The snug card
        </Link>
      </MallNotice>
    </div>
  );
}
