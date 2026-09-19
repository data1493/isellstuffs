import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SPLICE_ADS_LINE,
  SPLICE_COOKIE_NAME,
  SPLICE_NOTICE_TITLE,
  SPLICE_STILL_LINE,
  SPLICE_TABLE_LINE,
  SPLICE_TOTE_LINE,
  isListingSpliceOverlay,
  parseSpliceListingIds,
} from "@/lib/listing-splice";
import { listingSplicePath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-splice. Does not change the tote. */
export async function ListingSpliceNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseSpliceListingIds(jar.get(SPLICE_COOKIE_NAME)?.value);

  if (!isListingSpliceOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-splice-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SPLICE_TABLE_LINE}
        title={SPLICE_NOTICE_TITLE}
        body={`${SPLICE_ADS_LINE} ${SPLICE_STILL_LINE} ${SPLICE_TOTE_LINE}`}
      >
        <Link
          href={listingSplicePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The splice card
        </Link>
      </MallNotice>
    </div>
  );
}
