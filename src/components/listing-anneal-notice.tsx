import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  ANNEAL_COOKIE_NAME,
  ANNEAL_METAL_LINE,
  ANNEAL_NOTICE_TITLE,
  ANNEAL_SPLAY_LINE,
  ANNEAL_STILL_LINE,
  ANNEAL_TABLE_LINE,
  ANNEAL_TOTE_LINE,
  isListingAnnealOverlay,
  parseAnnealListingIds,
} from "@/lib/listing-anneal";
import { listingAnnealPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-anneal-it. Reads the cookie only. */
export async function ListingAnnealNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseAnnealListingIds(jar.get(ANNEAL_COOKIE_NAME)?.value);

  if (!isListingAnnealOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-anneal-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={ANNEAL_TABLE_LINE}
        title={ANNEAL_NOTICE_TITLE}
        body={`${ANNEAL_SPLAY_LINE} ${ANNEAL_METAL_LINE} ${ANNEAL_STILL_LINE} ${ANNEAL_TOTE_LINE}`}
      >
        <Link
          href={listingAnnealPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The anneal card
        </Link>
      </MallNotice>
    </div>
  );
}
