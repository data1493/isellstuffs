import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SHEAR_COOKIE_NAME,
  SHEAR_GREEN_LINE,
  SHEAR_NOTICE_TITLE,
  SHEAR_SMELL_LINE,
  SHEAR_STILL_LINE,
  SHEAR_TABLE_LINE,
  SHEAR_TOTE_LINE,
  isListingShearOverlay,
  parseShearListingIds,
} from "@/lib/listing-shear";
import { listingShearPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-shear-it. Reads the cookie only. */
export async function ListingShearNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseShearListingIds(jar.get(SHEAR_COOKIE_NAME)?.value);

  if (!isListingShearOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-shear-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SHEAR_TABLE_LINE}
        title={SHEAR_NOTICE_TITLE}
        body={`${SHEAR_GREEN_LINE} ${SHEAR_SMELL_LINE} ${SHEAR_STILL_LINE} ${SHEAR_TOTE_LINE}`}
      >
        <Link
          href={listingShearPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The shear card
        </Link>
      </MallNotice>
    </div>
  );
}
