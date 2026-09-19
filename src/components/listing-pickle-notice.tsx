import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PICKLE_CHIPPED_LINE,
  PICKLE_COOKIE_NAME,
  PICKLE_MUG_LINE,
  PICKLE_NOTICE_TITLE,
  PICKLE_STILL_LINE,
  PICKLE_TABLE_LINE,
  PICKLE_TOTE_LINE,
  isListingPickleOverlay,
  parsePickleListingIds,
} from "@/lib/listing-pickle";
import { listingPicklePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-pickle-it. Reads the cookie only. */
export async function ListingPickleNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parsePickleListingIds(jar.get(PICKLE_COOKIE_NAME)?.value);

  if (!isListingPickleOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-pickle-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PICKLE_TABLE_LINE}
        title={PICKLE_NOTICE_TITLE}
        body={`${PICKLE_CHIPPED_LINE} ${PICKLE_MUG_LINE} ${PICKLE_STILL_LINE} ${PICKLE_TOTE_LINE}`}
      >
        <Link
          href={listingPicklePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The pickle card
        </Link>
      </MallNotice>
    </div>
  );
}
