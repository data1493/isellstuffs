import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  NORM_COOKIE_NAME,
  NORM_NOTICE_TITLE,
  NORM_STAYS_LINE,
  NORM_STILL_LINE,
  NORM_TABLE_LINE,
  NORM_TOTE_LINE,
  NORM_WALK_LINE,
  isListingNormOverlay,
  parseNormListingIds,
} from "@/lib/listing-norm";
import { listingNormPath } from "@/lib/paths";

/** PDP banner when this file stays as recorded. Does not change the tote. */
export async function ListingNormNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseNormListingIds(jar.get(NORM_COOKIE_NAME)?.value);

  if (!isListingNormOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-norm-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={NORM_TABLE_LINE}
        title={NORM_NOTICE_TITLE}
        body={`${NORM_STAYS_LINE} ${NORM_WALK_LINE} ${NORM_STILL_LINE} ${NORM_TOTE_LINE}`}
      >
        <Link
          href={listingNormPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The normalize card
        </Link>
      </MallNotice>
    </div>
  );
}
