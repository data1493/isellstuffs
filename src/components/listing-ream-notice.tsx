import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  REAM_COOKIE_NAME,
  REAM_CRACK_LINE,
  REAM_LIGHTS_LINE,
  REAM_NOTICE_TITLE,
  REAM_STILL_LINE,
  REAM_TABLE_LINE,
  REAM_TOTE_LINE,
  isListingReamOverlay,
  parseReamListingIds,
} from "@/lib/listing-ream";
import { listingReamPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-ream-it. Reads the cookie only. */
export async function ListingReamNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseReamListingIds(jar.get(REAM_COOKIE_NAME)?.value);

  if (!isListingReamOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-ream-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={REAM_TABLE_LINE}
        title={REAM_NOTICE_TITLE}
        body={`${REAM_CRACK_LINE} ${REAM_LIGHTS_LINE} ${REAM_STILL_LINE} ${REAM_TOTE_LINE}`}
      >
        <Link
          href={listingReamPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The ream card
        </Link>
      </MallNotice>
    </div>
  );
}
