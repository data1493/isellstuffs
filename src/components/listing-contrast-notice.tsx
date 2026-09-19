import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CONTRAST_COOKIE_NAME,
  CONTRAST_DIM_LINE,
  CONTRAST_LINE_LINE,
  CONTRAST_NOTICE_TITLE,
  CONTRAST_STILL_LINE,
  CONTRAST_TABLE_LINE,
  CONTRAST_TOTE_LINE,
  isListingContrastOverlay,
  parseContrastListingIds,
} from "@/lib/listing-contrast";
import { listingContrastPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-contrast-it. Reads the cookie only. */
export async function ListingContrastNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseContrastListingIds(jar.get(CONTRAST_COOKIE_NAME)?.value);

  if (!isListingContrastOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-contrast-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={CONTRAST_TABLE_LINE}
        title={CONTRAST_NOTICE_TITLE}
        body={`${CONTRAST_LINE_LINE} ${CONTRAST_DIM_LINE} ${CONTRAST_STILL_LINE} ${CONTRAST_TOTE_LINE}`}
      >
        <Link
          href={listingContrastPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The contrast card
        </Link>
      </MallNotice>
    </div>
  );
}
