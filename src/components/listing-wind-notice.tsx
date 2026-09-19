import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  WIND_COOKIE_NAME,
  WIND_HISS_LINE,
  WIND_NOTICE_TITLE,
  WIND_RADIO_LINE,
  WIND_STILL_LINE,
  WIND_TABLE_LINE,
  WIND_TOTE_LINE,
  isListingWindOverlay,
  parseWindListingIds,
} from "@/lib/listing-wind";
import { listingWindPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-wind-it. Reads the cookie only. */
export async function ListingWindNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseWindListingIds(jar.get(WIND_COOKIE_NAME)?.value);

  if (!isListingWindOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-wind-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={WIND_TABLE_LINE}
        title={WIND_NOTICE_TITLE}
        body={`${WIND_HISS_LINE} ${WIND_RADIO_LINE} ${WIND_STILL_LINE} ${WIND_TOTE_LINE}`}
      >
        <Link
          href={listingWindPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The wind card
        </Link>
      </MallNotice>
    </div>
  );
}
