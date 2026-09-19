import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  AZIMUTH_COOKIE_NAME,
  AZIMUTH_HISS_LINE,
  AZIMUTH_NINETY_LINE,
  AZIMUTH_NOTICE_TITLE,
  AZIMUTH_STILL_LINE,
  AZIMUTH_TABLE_LINE,
  AZIMUTH_TOTE_LINE,
  isListingAzimuthOverlay,
  parseAzimuthListingIds,
} from "@/lib/listing-azimuth";
import { listingAzimuthPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-azimuth-it. Reads the cookie only. */
export async function ListingAzimuthNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseAzimuthListingIds(jar.get(AZIMUTH_COOKIE_NAME)?.value);

  if (!isListingAzimuthOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-azimuth-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={AZIMUTH_TABLE_LINE}
        title={AZIMUTH_NOTICE_TITLE}
        body={`${AZIMUTH_HISS_LINE} ${AZIMUTH_NINETY_LINE} ${AZIMUTH_STILL_LINE} ${AZIMUTH_TOTE_LINE}`}
      >
        <Link
          href={listingAzimuthPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The azimuth card
        </Link>
      </MallNotice>
    </div>
  );
}
