import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SAUCER_COOKIE_NAME,
  SAUCER_FOR_SALE_LINE,
  SAUCER_MUG_LINE,
  SAUCER_NOTICE_TITLE,
  SAUCER_TABLE_LINE,
  SAUCER_TOTE_LINE,
  isListingSaucerOverlay,
  parseSaucerListingIds,
} from "@/lib/listing-saucer";
import { listingSaucerPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-don't-have-a-saucer. Does not change the tote. */
export async function ListingSaucerNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseSaucerListingIds(jar.get(SAUCER_COOKIE_NAME)?.value);

  if (!isListingSaucerOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-saucer-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SAUCER_TABLE_LINE}
        title={SAUCER_NOTICE_TITLE}
        body={`${SAUCER_MUG_LINE} ${SAUCER_FOR_SALE_LINE} ${SAUCER_TOTE_LINE}`}
      >
        <Link
          href={listingSaucerPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The saucer card
        </Link>
      </MallNotice>
    </div>
  );
}
