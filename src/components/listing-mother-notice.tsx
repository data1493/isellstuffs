import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  MOTHER_COOKIE_NAME,
  MOTHER_NOTICE_TITLE,
  MOTHER_SKIP_LINE,
  MOTHER_STILL_LINE,
  MOTHER_TABLE_LINE,
  MOTHER_TOTE_LINE,
  MOTHER_UNNAMED_LINE,
  isListingMotherOverlay,
  parseMotherListingIds,
} from "@/lib/listing-mother";
import { listingMotherPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-mother-it. Reads the cookie only. */
export async function ListingMotherNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseMotherListingIds(jar.get(MOTHER_COOKIE_NAME)?.value);

  if (!isListingMotherOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-mother-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={MOTHER_TABLE_LINE}
        title={MOTHER_NOTICE_TITLE}
        body={`${MOTHER_SKIP_LINE} ${MOTHER_UNNAMED_LINE} ${MOTHER_STILL_LINE} ${MOTHER_TOTE_LINE}`}
      >
        <Link
          href={listingMotherPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The mother card
        </Link>
      </MallNotice>
    </div>
  );
}
