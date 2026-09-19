import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  FLOCK_COOKIE_NAME,
  FLOCK_CRACK_LINE,
  FLOCK_EMPTY_CASES_LINE,
  FLOCK_NOTICE_TITLE,
  FLOCK_STILL_LINE,
  FLOCK_TABLE_LINE,
  FLOCK_TOTE_LINE,
  isListingFlockOverlay,
  parseFlockListingIds,
} from "@/lib/listing-flock";
import { listingFlockPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-flock-them. Reads the cookie only. */
export async function ListingFlockNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseFlockListingIds(jar.get(FLOCK_COOKIE_NAME)?.value);

  if (!isListingFlockOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-flock-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={FLOCK_TABLE_LINE}
        title={FLOCK_NOTICE_TITLE}
        body={`${FLOCK_EMPTY_CASES_LINE} ${FLOCK_CRACK_LINE} ${FLOCK_STILL_LINE} ${FLOCK_TOTE_LINE}`}
      >
        <Link
          href={listingFlockPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The flock card
        </Link>
      </MallNotice>
    </div>
  );
}
