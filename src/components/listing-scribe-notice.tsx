import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SCRIBE_COOKIE_NAME,
  SCRIBE_LID_LINE,
  SCRIBE_NOTICE_TITLE,
  SCRIBE_POT_LINE,
  SCRIBE_STILL_LINE,
  SCRIBE_TABLE_LINE,
  SCRIBE_TOTE_LINE,
  isListingScribeOverlay,
  parseScribeListingIds,
} from "@/lib/listing-scribe";
import { listingScribePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-scribe-it. Reads the cookie only. */
export async function ListingScribeNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseScribeListingIds(jar.get(SCRIBE_COOKIE_NAME)?.value);

  if (!isListingScribeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-scribe-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SCRIBE_TABLE_LINE}
        title={SCRIBE_NOTICE_TITLE}
        body={`${SCRIBE_LID_LINE} ${SCRIBE_POT_LINE} ${SCRIBE_STILL_LINE} ${SCRIBE_TOTE_LINE}`}
      >
        <Link
          href={listingScribePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The scribe card
        </Link>
      </MallNotice>
    </div>
  );
}
