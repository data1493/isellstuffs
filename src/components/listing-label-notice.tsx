import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  LABEL_COOKIE_NAME,
  LABEL_NOTICE_TITLE,
  LABEL_PILE_LINE,
  LABEL_STILL_LINE,
  LABEL_TABLE_LINE,
  LABEL_TOTE_LINE,
  LABEL_UNTESTED_LINE,
  isListingLabelOverlay,
  parseLabelListingIds,
} from "@/lib/listing-label";
import { listingLabelPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-label-them. Reads the cookie only. */
export async function ListingLabelNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseLabelListingIds(jar.get(LABEL_COOKIE_NAME)?.value);

  if (!isListingLabelOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-label-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={LABEL_TABLE_LINE}
        title={LABEL_NOTICE_TITLE}
        body={`${LABEL_PILE_LINE} ${LABEL_UNTESTED_LINE} ${LABEL_STILL_LINE} ${LABEL_TOTE_LINE}`}
      >
        <Link
          href={listingLabelPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The label card
        </Link>
      </MallNotice>
    </div>
  );
}
