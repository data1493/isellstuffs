import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  LOOM_COOKIE_NAME,
  LOOM_ENDS_LINE,
  LOOM_NOTICE_TITLE,
  LOOM_STILL_LINE,
  LOOM_TABLE_LINE,
  LOOM_TANGLE_LINE,
  LOOM_TOTE_LINE,
  isListingLoomOverlay,
  parseLoomListingIds,
} from "@/lib/listing-loom";
import { listingLoomPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-loom-them. Reads the cookie only. */
export async function ListingLoomNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseLoomListingIds(jar.get(LOOM_COOKIE_NAME)?.value);

  if (!isListingLoomOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-loom-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={LOOM_TABLE_LINE}
        title={LOOM_NOTICE_TITLE}
        body={`${LOOM_TANGLE_LINE} ${LOOM_ENDS_LINE} ${LOOM_STILL_LINE} ${LOOM_TOTE_LINE}`}
      >
        <Link
          href={listingLoomPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The loom card
        </Link>
      </MallNotice>
    </div>
  );
}
