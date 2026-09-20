import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  HMTX_BOLD_LINE,
  HMTX_COOKIE_NAME,
  HMTX_NOTICE_TITLE,
  HMTX_STILL_LINE,
  HMTX_TABLE_LINE,
  HMTX_TOTE_LINE,
  HMTX_WEIGHTS_LINE,
  isListingHmtxOverlay,
  parseHmtxListingIds,
} from "@/lib/listing-hmtx";
import { listingHmtxPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-hmtx-it. Reads the cookie only. */
export async function ListingHmtxNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseHmtxListingIds(jar.get(HMTX_COOKIE_NAME)?.value);

  if (!isListingHmtxOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-hmtx-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={HMTX_TABLE_LINE}
        title={HMTX_NOTICE_TITLE}
        body={`${HMTX_WEIGHTS_LINE} ${HMTX_BOLD_LINE} ${HMTX_STILL_LINE} ${HMTX_TOTE_LINE}`}
      >
        <Link
          href={listingHmtxPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The hmtx card
        </Link>
      </MallNotice>
    </div>
  );
}
