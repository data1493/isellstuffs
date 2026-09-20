import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  RECASE_COOKIE_NAME,
  RECASE_FADING_LINE,
  RECASE_HISS_LINE,
  RECASE_NOTICE_TITLE,
  RECASE_STILL_LINE,
  RECASE_TABLE_LINE,
  RECASE_TOTE_LINE,
  isListingRecaseOverlay,
  parseRecaseListingIds,
} from "@/lib/listing-recase";
import { listingRecasePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-recase-it. Reads the cookie only. */
export async function ListingRecaseNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseRecaseListingIds(jar.get(RECASE_COOKIE_NAME)?.value);

  if (!isListingRecaseOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-recase-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={RECASE_TABLE_LINE}
        title={RECASE_NOTICE_TITLE}
        body={`${RECASE_FADING_LINE} ${RECASE_HISS_LINE} ${RECASE_STILL_LINE} ${RECASE_TOTE_LINE}`}
      >
        <Link
          href={listingRecasePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The recase card
        </Link>
      </MallNotice>
    </div>
  );
}
