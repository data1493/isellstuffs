import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  TIN_COOKIE_NAME,
  TIN_NOTICE_TITLE,
  TIN_PILE_LINE,
  TIN_STILL_LINE,
  TIN_TABLE_LINE,
  TIN_TOTE_LINE,
  TIN_UNTESTED_LINE,
  isListingTinOverlay,
  parseTinListingIds,
} from "@/lib/listing-tin";
import { listingTinPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-tin-them. Reads the cookie only. */
export async function ListingTinNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseTinListingIds(jar.get(TIN_COOKIE_NAME)?.value);

  if (!isListingTinOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-tin-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={TIN_TABLE_LINE}
        title={TIN_NOTICE_TITLE}
        body={`${TIN_PILE_LINE} ${TIN_UNTESTED_LINE} ${TIN_STILL_LINE} ${TIN_TOTE_LINE}`}
      >
        <Link
          href={listingTinPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The tin card
        </Link>
      </MallNotice>
    </div>
  );
}
