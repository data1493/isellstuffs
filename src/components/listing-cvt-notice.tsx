import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CVT_BOLD_LINE,
  CVT_COOKIE_NAME,
  CVT_NOTICE_TITLE,
  CVT_STILL_LINE,
  CVT_TABLE_LINE,
  CVT_TOTE_LINE,
  CVT_WEIGHTS_LINE,
  isListingCvtOverlay,
  parseCvtListingIds,
} from "@/lib/listing-cvt";
import { listingCvtPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-cvt-it. Reads the cookie only. */
export async function ListingCvtNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseCvtListingIds(jar.get(CVT_COOKIE_NAME)?.value);

  if (!isListingCvtOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-cvt-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={CVT_TABLE_LINE}
        title={CVT_NOTICE_TITLE}
        body={`${CVT_WEIGHTS_LINE} ${CVT_BOLD_LINE} ${CVT_STILL_LINE} ${CVT_TOTE_LINE}`}
      >
        <Link
          href={listingCvtPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The cvt card
        </Link>
      </MallNotice>
    </div>
  );
}
