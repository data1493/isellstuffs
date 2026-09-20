import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  TREPAN_COOKIE_NAME,
  TREPAN_LID_LINE,
  TREPAN_NOTICE_TITLE,
  TREPAN_POT_LINE,
  TREPAN_STILL_LINE,
  TREPAN_TABLE_LINE,
  TREPAN_TOTE_LINE,
  isListingTrepanOverlay,
  parseTrepanListingIds,
} from "@/lib/listing-trepan";
import { listingTrepanPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-trepan-it. Reads the cookie only. */
export async function ListingTrepanNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseTrepanListingIds(jar.get(TREPAN_COOKIE_NAME)?.value);

  if (!isListingTrepanOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-trepan-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={TREPAN_TABLE_LINE}
        title={TREPAN_NOTICE_TITLE}
        body={`${TREPAN_LID_LINE} ${TREPAN_POT_LINE} ${TREPAN_STILL_LINE} ${TREPAN_TOTE_LINE}`}
      >
        <Link
          href={listingTrepanPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The trepan card
        </Link>
      </MallNotice>
    </div>
  );
}
