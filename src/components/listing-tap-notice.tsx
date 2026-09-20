import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  TAP_COOKIE_NAME,
  TAP_LID_LINE,
  TAP_NOTICE_TITLE,
  TAP_POT_LINE,
  TAP_STILL_LINE,
  TAP_TABLE_LINE,
  TAP_TOTE_LINE,
  isListingTapOverlay,
  parseTapListingIds,
} from "@/lib/listing-tap";
import { listingTapPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-tap-it. Reads the cookie only. */
export async function ListingTapNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseTapListingIds(jar.get(TAP_COOKIE_NAME)?.value);

  if (!isListingTapOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-tap-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={TAP_TABLE_LINE}
        title={TAP_NOTICE_TITLE}
        body={`${TAP_LID_LINE} ${TAP_POT_LINE} ${TAP_STILL_LINE} ${TAP_TOTE_LINE}`}
      >
        <Link
          href={listingTapPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The tap card
        </Link>
      </MallNotice>
    </div>
  );
}
