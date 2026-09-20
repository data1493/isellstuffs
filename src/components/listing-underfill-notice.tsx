import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  UNDERFILL_COOKIE_NAME,
  UNDERFILL_CRACK_LINE,
  UNDERFILL_NOTICE_TITLE,
  UNDERFILL_STILL_LINE,
  UNDERFILL_TABLE_LINE,
  UNDERFILL_TETRIS_LINE,
  UNDERFILL_TOTE_LINE,
  isListingUnderfillOverlay,
  parseUnderfillListingIds,
} from "@/lib/listing-underfill";
import { listingUnderfillPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-underfill-it. Reads the cookie only. */
export async function ListingUnderfillNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseUnderfillListingIds(jar.get(UNDERFILL_COOKIE_NAME)?.value);

  if (!isListingUnderfillOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-underfill-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={UNDERFILL_TABLE_LINE}
        title={UNDERFILL_NOTICE_TITLE}
        body={`${UNDERFILL_CRACK_LINE} ${UNDERFILL_TETRIS_LINE} ${UNDERFILL_STILL_LINE} ${UNDERFILL_TOTE_LINE}`}
      >
        <Link
          href={listingUnderfillPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The underfill card
        </Link>
      </MallNotice>
    </div>
  );
}
