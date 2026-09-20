import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GSUB_BOLD_LINE,
  GSUB_COOKIE_NAME,
  GSUB_NOTICE_TITLE,
  GSUB_STILL_LINE,
  GSUB_TABLE_LINE,
  GSUB_TOTE_LINE,
  GSUB_WEIGHTS_LINE,
  isListingGsubOverlay,
  parseGsubListingIds,
} from "@/lib/listing-gsub";
import { listingGsubPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-gsub-it. Reads the cookie only. */
export async function ListingGsubNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseGsubListingIds(jar.get(GSUB_COOKIE_NAME)?.value);

  if (!isListingGsubOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-gsub-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GSUB_TABLE_LINE}
        title={GSUB_NOTICE_TITLE}
        body={`${GSUB_WEIGHTS_LINE} ${GSUB_BOLD_LINE} ${GSUB_STILL_LINE} ${GSUB_TOTE_LINE}`}
      >
        <Link
          href={listingGsubPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The gsub card
        </Link>
      </MallNotice>
    </div>
  );
}
