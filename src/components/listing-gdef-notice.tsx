import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GDEF_BOLD_LINE,
  GDEF_COOKIE_NAME,
  GDEF_NOTICE_TITLE,
  GDEF_STILL_LINE,
  GDEF_TABLE_LINE,
  GDEF_TOTE_LINE,
  GDEF_WEIGHTS_LINE,
  isListingGdefOverlay,
  parseGdefListingIds,
} from "@/lib/listing-gdef";
import { listingGdefPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-gdef-it. Reads the cookie only. */
export async function ListingGdefNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseGdefListingIds(jar.get(GDEF_COOKIE_NAME)?.value);

  if (!isListingGdefOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-gdef-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GDEF_TABLE_LINE}
        title={GDEF_NOTICE_TITLE}
        body={`${GDEF_WEIGHTS_LINE} ${GDEF_BOLD_LINE} ${GDEF_STILL_LINE} ${GDEF_TOTE_LINE}`}
      >
        <Link
          href={listingGdefPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The gdef card
        </Link>
      </MallNotice>
    </div>
  );
}
