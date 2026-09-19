import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  DOLBY_COOKIE_NAME,
  DOLBY_HISS_LINE,
  DOLBY_NOTICE_TITLE,
  DOLBY_STILL_LINE,
  DOLBY_SUMMER_LINE,
  DOLBY_TABLE_LINE,
  DOLBY_TOTE_LINE,
  isListingDolbyOverlay,
  parseDolbyListingIds,
} from "@/lib/listing-dolby";
import { listingDolbyPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-Dolby-it. Reads the cookie only. */
export async function ListingDolbyNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseDolbyListingIds(jar.get(DOLBY_COOKIE_NAME)?.value);

  if (!isListingDolbyOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-dolby-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={DOLBY_TABLE_LINE}
        title={DOLBY_NOTICE_TITLE}
        body={`${DOLBY_HISS_LINE} ${DOLBY_SUMMER_LINE} ${DOLBY_STILL_LINE} ${DOLBY_TOTE_LINE}`}
      >
        <Link
          href={listingDolbyPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The Dolby card
        </Link>
      </MallNotice>
    </div>
  );
}
