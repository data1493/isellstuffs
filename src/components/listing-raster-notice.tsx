import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  RASTER_BOLD_LINE,
  RASTER_COOKIE_NAME,
  RASTER_NOTICE_TITLE,
  RASTER_STILL_LINE,
  RASTER_TABLE_LINE,
  RASTER_TOTE_LINE,
  RASTER_WEIGHTS_LINE,
  isListingRasterOverlay,
  parseRasterListingIds,
} from "@/lib/listing-raster";
import { listingRasterPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-raster-it. Reads the cookie only. */
export async function ListingRasterNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseRasterListingIds(jar.get(RASTER_COOKIE_NAME)?.value);

  if (!isListingRasterOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-raster-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={RASTER_TABLE_LINE}
        title={RASTER_NOTICE_TITLE}
        body={`${RASTER_WEIGHTS_LINE} ${RASTER_BOLD_LINE} ${RASTER_STILL_LINE} ${RASTER_TOTE_LINE}`}
      >
        <Link
          href={listingRasterPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The raster card
        </Link>
      </MallNotice>
    </div>
  );
}
