import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  DESCREEN_CARDS_LINE,
  DESCREEN_COOKIE_NAME,
  DESCREEN_GREASE_LINE,
  DESCREEN_NOTICE_TITLE,
  DESCREEN_STILL_LINE,
  DESCREEN_TABLE_LINE,
  DESCREEN_TOTE_LINE,
  isListingDescreenOverlay,
  parseDescreenListingIds,
} from "@/lib/listing-descreen";
import { listingDescreenPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-descreen-them. Reads the cookie only. */
export async function ListingDescreenNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseDescreenListingIds(jar.get(DESCREEN_COOKIE_NAME)?.value);

  if (!isListingDescreenOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-descreen-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={DESCREEN_TABLE_LINE}
        title={DESCREEN_NOTICE_TITLE}
        body={`${DESCREEN_CARDS_LINE} ${DESCREEN_GREASE_LINE} ${DESCREEN_STILL_LINE} ${DESCREEN_TOTE_LINE}`}
      >
        <Link
          href={listingDescreenPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The descreen card
        </Link>
      </MallNotice>
    </div>
  );
}
