import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  QUENCH_COOKIE_NAME,
  QUENCH_NOTICE_TITLE,
  QUENCH_SPLAY_LINE,
  QUENCH_STILL_LINE,
  QUENCH_TABLE_LINE,
  QUENCH_TOTE_LINE,
  QUENCH_WHISK_LINE,
  isListingQuenchOverlay,
  parseQuenchListingIds,
} from "@/lib/listing-quench";
import { listingQuenchPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-quench-it. Reads the cookie only. */
export async function ListingQuenchNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseQuenchListingIds(jar.get(QUENCH_COOKIE_NAME)?.value);

  if (!isListingQuenchOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-quench-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={QUENCH_TABLE_LINE}
        title={QUENCH_NOTICE_TITLE}
        body={`${QUENCH_SPLAY_LINE} ${QUENCH_WHISK_LINE} ${QUENCH_STILL_LINE} ${QUENCH_TOTE_LINE}`}
      >
        <Link
          href={listingQuenchPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The quench card
        </Link>
      </MallNotice>
    </div>
  );
}
