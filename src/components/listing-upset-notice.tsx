import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  UPSET_BENT_LINE,
  UPSET_COOKIE_NAME,
  UPSET_METAL_LINE,
  UPSET_NOTICE_TITLE,
  UPSET_STILL_LINE,
  UPSET_TABLE_LINE,
  UPSET_TOTE_LINE,
  isListingUpsetOverlay,
  parseUpsetListingIds,
} from "@/lib/listing-upset";
import { listingUpsetPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-upset-it. Reads the cookie only. */
export async function ListingUpsetNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseUpsetListingIds(jar.get(UPSET_COOKIE_NAME)?.value);

  if (!isListingUpsetOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-upset-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={UPSET_TABLE_LINE}
        title={UPSET_NOTICE_TITLE}
        body={`${UPSET_BENT_LINE} ${UPSET_METAL_LINE} ${UPSET_STILL_LINE} ${UPSET_TOTE_LINE}`}
      >
        <Link
          href={listingUpsetPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The upset card
        </Link>
      </MallNotice>
    </div>
  );
}
