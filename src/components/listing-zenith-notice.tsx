import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  ZENITH_COOKIE_NAME,
  ZENITH_NOTICE_TITLE,
  ZENITH_SKIP_LINE,
  ZENITH_STILL_LINE,
  ZENITH_TABLE_LINE,
  ZENITH_TOTE_LINE,
  ZENITH_UNNAMED_LINE,
  isListingZenithOverlay,
  parseZenithListingIds,
} from "@/lib/listing-zenith";
import { listingZenithPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-zenith-it. Reads the cookie only. */
export async function ListingZenithNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseZenithListingIds(jar.get(ZENITH_COOKIE_NAME)?.value);

  if (!isListingZenithOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-zenith-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={ZENITH_TABLE_LINE}
        title={ZENITH_NOTICE_TITLE}
        body={`${ZENITH_SKIP_LINE} ${ZENITH_UNNAMED_LINE} ${ZENITH_STILL_LINE} ${ZENITH_TOTE_LINE}`}
      >
        <Link
          href={listingZenithPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The zenith card
        </Link>
      </MallNotice>
    </div>
  );
}
