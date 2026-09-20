import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BLANCHARD_COOKIE_NAME,
  BLANCHARD_LID_LINE,
  BLANCHARD_NOTICE_TITLE,
  BLANCHARD_POT_LINE,
  BLANCHARD_STILL_LINE,
  BLANCHARD_TABLE_LINE,
  BLANCHARD_TOTE_LINE,
  isListingBlanchardOverlay,
  parseBlanchardListingIds,
} from "@/lib/listing-blanchard";
import { listingBlanchardPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-blanchard-it. Reads the cookie only. */
export async function ListingBlanchardNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseBlanchardListingIds(jar.get(BLANCHARD_COOKIE_NAME)?.value);

  if (!isListingBlanchardOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-blanchard-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BLANCHARD_TABLE_LINE}
        title={BLANCHARD_NOTICE_TITLE}
        body={`${BLANCHARD_LID_LINE} ${BLANCHARD_POT_LINE} ${BLANCHARD_STILL_LINE} ${BLANCHARD_TOTE_LINE}`}
      >
        <Link
          href={listingBlanchardPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The blanchard card
        </Link>
      </MallNotice>
    </div>
  );
}
