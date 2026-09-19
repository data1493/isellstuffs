import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  OUTLINE_COOKIE_NAME,
  OUTLINE_NOTICE_TITLE,
  OUTLINE_OTF_LINE,
  OUTLINE_STILL_LINE,
  OUTLINE_TABLE_LINE,
  OUTLINE_TOTE_LINE,
  OUTLINE_WEIGHTS_LINE,
  isListingOutlineOverlay,
  parseOutlineListingIds,
} from "@/lib/listing-outline";
import { listingOutlinePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-outline-them. Reads the cookie only. */
export async function ListingOutlineNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseOutlineListingIds(jar.get(OUTLINE_COOKIE_NAME)?.value);

  if (!isListingOutlineOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-outline-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={OUTLINE_TABLE_LINE}
        title={OUTLINE_NOTICE_TITLE}
        body={`${OUTLINE_WEIGHTS_LINE} ${OUTLINE_OTF_LINE} ${OUTLINE_STILL_LINE} ${OUTLINE_TOTE_LINE}`}
      >
        <Link
          href={listingOutlinePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The outline card
        </Link>
      </MallNotice>
    </div>
  );
}
