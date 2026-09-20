import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  STILT_COFFEE_LINE,
  STILT_COOKIE_NAME,
  STILT_NOTICE_TITLE,
  STILT_RIM_LINE,
  STILT_STILL_LINE,
  STILT_TABLE_LINE,
  STILT_TOTE_LINE,
  isListingStiltOverlay,
  parseStiltListingIds,
} from "@/lib/listing-stilt";
import { listingStiltPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-stilt-it. Reads the cookie only. */
export async function ListingStiltNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseStiltListingIds(jar.get(STILT_COOKIE_NAME)?.value);

  if (!isListingStiltOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-stilt-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={STILT_TABLE_LINE}
        title={STILT_NOTICE_TITLE}
        body={`${STILT_RIM_LINE} ${STILT_COFFEE_LINE} ${STILT_STILL_LINE} ${STILT_TOTE_LINE}`}
      >
        <Link
          href={listingStiltPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The stilt card
        </Link>
      </MallNotice>
    </div>
  );
}
