import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  NEST_COOKIE_NAME,
  NEST_EMPTY_CASES_LINE,
  NEST_NOTICE_TITLE,
  NEST_PILE_LINE,
  NEST_STILL_LINE,
  NEST_TABLE_LINE,
  NEST_TOTE_LINE,
  isListingNestOverlay,
  parseNestListingIds,
} from "@/lib/listing-nest";
import { listingNestPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-nest-them. Reads the cookie only. */
export async function ListingNestNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseNestListingIds(jar.get(NEST_COOKIE_NAME)?.value);

  if (!isListingNestOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-nest-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={NEST_TABLE_LINE}
        title={NEST_NOTICE_TITLE}
        body={`${NEST_PILE_LINE} ${NEST_EMPTY_CASES_LINE} ${NEST_STILL_LINE} ${NEST_TOTE_LINE}`}
      >
        <Link
          href={listingNestPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The nest card
        </Link>
      </MallNotice>
    </div>
  );
}
