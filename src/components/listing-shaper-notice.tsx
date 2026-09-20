import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SHAPER_COOKIE_NAME,
  SHAPER_FLUORO_LINE,
  SHAPER_LOOKS_LINE,
  SHAPER_NOTICE_TITLE,
  SHAPER_STILL_LINE,
  SHAPER_TABLE_LINE,
  SHAPER_TOTE_LINE,
  isListingShaperOverlay,
  parseShaperListingIds,
} from "@/lib/listing-shaper";
import { listingShaperPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-shaper-them. Reads the cookie only. */
export async function ListingShaperNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseShaperListingIds(jar.get(SHAPER_COOKIE_NAME)?.value);

  if (!isListingShaperOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-shaper-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SHAPER_TABLE_LINE}
        title={SHAPER_NOTICE_TITLE}
        body={`${SHAPER_LOOKS_LINE} ${SHAPER_FLUORO_LINE} ${SHAPER_STILL_LINE} ${SHAPER_TOTE_LINE}`}
      >
        <Link
          href={listingShaperPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The shaper card
        </Link>
      </MallNotice>
    </div>
  );
}
