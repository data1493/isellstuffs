import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SERGE_CAR_LINE,
  SERGE_COOKIE_NAME,
  SERGE_NOTICE_TITLE,
  SERGE_STILL_LINE,
  SERGE_TABLE_LINE,
  SERGE_TOTE_LINE,
  SERGE_WORN_LINE,
  isListingSergeOverlay,
  parseSergeListingIds,
} from "@/lib/listing-serge";
import { listingSergePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-serge-it. Reads the cookie only. */
export async function ListingSergeNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseSergeListingIds(jar.get(SERGE_COOKIE_NAME)?.value);

  if (!isListingSergeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-serge-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SERGE_TABLE_LINE}
        title={SERGE_NOTICE_TITLE}
        body={`${SERGE_WORN_LINE} ${SERGE_CAR_LINE} ${SERGE_STILL_LINE} ${SERGE_TOTE_LINE}`}
      >
        <Link
          href={listingSergePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The serge card
        </Link>
      </MallNotice>
    </div>
  );
}
