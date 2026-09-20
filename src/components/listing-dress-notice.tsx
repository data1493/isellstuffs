import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  DRESS_COOKIE_NAME,
  DRESS_LID_LINE,
  DRESS_NOTICE_TITLE,
  DRESS_POT_LINE,
  DRESS_STILL_LINE,
  DRESS_TABLE_LINE,
  DRESS_TOTE_LINE,
  isListingDressOverlay,
  parseDressListingIds,
} from "@/lib/listing-dress";
import { listingDressPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-dress-it. Reads the cookie only. */
export async function ListingDressNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseDressListingIds(jar.get(DRESS_COOKIE_NAME)?.value);

  if (!isListingDressOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-dress-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={DRESS_TABLE_LINE}
        title={DRESS_NOTICE_TITLE}
        body={`${DRESS_LID_LINE} ${DRESS_POT_LINE} ${DRESS_STILL_LINE} ${DRESS_TOTE_LINE}`}
      >
        <Link
          href={listingDressPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The dress card
        </Link>
      </MallNotice>
    </div>
  );
}
