import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  RAKE_COOKIE_NAME,
  RAKE_NOTICE_TITLE,
  RAKE_SKIP_LINE,
  RAKE_STILL_LINE,
  RAKE_TABLE_LINE,
  RAKE_TOTE_LINE,
  RAKE_UNNAMED_LINE,
  isListingRakeOverlay,
  parseRakeListingIds,
} from "@/lib/listing-rake";
import { listingRakePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-rake-it. Reads the cookie only. */
export async function ListingRakeNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseRakeListingIds(jar.get(RAKE_COOKIE_NAME)?.value);

  if (!isListingRakeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-rake-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={RAKE_TABLE_LINE}
        title={RAKE_NOTICE_TITLE}
        body={`${RAKE_SKIP_LINE} ${RAKE_UNNAMED_LINE} ${RAKE_STILL_LINE} ${RAKE_TOTE_LINE}`}
      >
        <Link
          href={listingRakePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The rake card
        </Link>
      </MallNotice>
    </div>
  );
}
