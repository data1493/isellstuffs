import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  TENTER_COOKIE_NAME,
  TENTER_GREEN_LINE,
  TENTER_NOTICE_TITLE,
  TENTER_SMELL_LINE,
  TENTER_STILL_LINE,
  TENTER_TABLE_LINE,
  TENTER_TOTE_LINE,
  isListingTenterOverlay,
  parseTenterListingIds,
} from "@/lib/listing-tenter";
import { listingTenterPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-tenter-it. Reads the cookie only. */
export async function ListingTenterNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseTenterListingIds(jar.get(TENTER_COOKIE_NAME)?.value);

  if (!isListingTenterOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-tenter-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={TENTER_TABLE_LINE}
        title={TENTER_NOTICE_TITLE}
        body={`${TENTER_GREEN_LINE} ${TENTER_SMELL_LINE} ${TENTER_STILL_LINE} ${TENTER_TOTE_LINE}`}
      >
        <Link
          href={listingTenterPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The tenter card
        </Link>
      </MallNotice>
    </div>
  );
}
