import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  RETIP_COOKIE_NAME,
  RETIP_NOTICE_TITLE,
  RETIP_SKIP_LINE,
  RETIP_STILL_LINE,
  RETIP_TABLE_LINE,
  RETIP_TOTE_LINE,
  RETIP_UNNAMED_LINE,
  isListingRetipOverlay,
  parseRetipListingIds,
} from "@/lib/listing-retip";
import { listingRetipPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-retip-it. Reads the cookie only. */
export async function ListingRetipNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseRetipListingIds(jar.get(RETIP_COOKIE_NAME)?.value);

  if (!isListingRetipOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-retip-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={RETIP_TABLE_LINE}
        title={RETIP_NOTICE_TITLE}
        body={`${RETIP_SKIP_LINE} ${RETIP_UNNAMED_LINE} ${RETIP_STILL_LINE} ${RETIP_TOTE_LINE}`}
      >
        <Link
          href={listingRetipPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The retip card
        </Link>
      </MallNotice>
    </div>
  );
}
