import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  FETTLE_CHIP_LINE,
  FETTLE_COOKIE_NAME,
  FETTLE_MUG_LINE,
  FETTLE_NOTICE_TITLE,
  FETTLE_STILL_LINE,
  FETTLE_TABLE_LINE,
  FETTLE_TOTE_LINE,
  isListingFettleOverlay,
  parseFettleListingIds,
} from "@/lib/listing-fettle";
import { listingFettlePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-fettle-it. Reads the cookie only. */
export async function ListingFettleNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseFettleListingIds(jar.get(FETTLE_COOKIE_NAME)?.value);

  if (!isListingFettleOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-fettle-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={FETTLE_TABLE_LINE}
        title={FETTLE_NOTICE_TITLE}
        body={`${FETTLE_CHIP_LINE} ${FETTLE_MUG_LINE} ${FETTLE_STILL_LINE} ${FETTLE_TOTE_LINE}`}
      >
        <Link
          href={listingFettlePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The fettle card
        </Link>
      </MallNotice>
    </div>
  );
}
