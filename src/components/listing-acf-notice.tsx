import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  ACF_COOKIE_NAME,
  ACF_CRACK_LINE,
  ACF_NOTICE_TITLE,
  ACF_STILL_LINE,
  ACF_TABLE_LINE,
  ACF_TETRIS_LINE,
  ACF_TOTE_LINE,
  isListingAcfOverlay,
  parseAcfListingIds,
} from "@/lib/listing-acf";
import { listingAcfPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-acf-it. Reads the cookie only. */
export async function ListingAcfNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseAcfListingIds(jar.get(ACF_COOKIE_NAME)?.value);

  if (!isListingAcfOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-acf-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={ACF_TABLE_LINE}
        title={ACF_NOTICE_TITLE}
        body={`${ACF_CRACK_LINE} ${ACF_TETRIS_LINE} ${ACF_STILL_LINE} ${ACF_TOTE_LINE}`}
      >
        <Link
          href={listingAcfPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The acf card
        </Link>
      </MallNotice>
    </div>
  );
}
