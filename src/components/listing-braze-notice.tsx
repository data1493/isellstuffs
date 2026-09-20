import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BRAZE_BENT_LINE,
  BRAZE_COOKIE_NAME,
  BRAZE_METAL_LINE,
  BRAZE_NOTICE_TITLE,
  BRAZE_STILL_LINE,
  BRAZE_TABLE_LINE,
  BRAZE_TOTE_LINE,
  isListingBrazeOverlay,
  parseBrazeListingIds,
} from "@/lib/listing-braze";
import { listingBrazePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-braze-it. Reads the cookie only. */
export async function ListingBrazeNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseBrazeListingIds(jar.get(BRAZE_COOKIE_NAME)?.value);

  if (!isListingBrazeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-braze-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BRAZE_TABLE_LINE}
        title={BRAZE_NOTICE_TITLE}
        body={`${BRAZE_BENT_LINE} ${BRAZE_METAL_LINE} ${BRAZE_STILL_LINE} ${BRAZE_TOTE_LINE}`}
      >
        <Link
          href={listingBrazePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The braze card
        </Link>
      </MallNotice>
    </div>
  );
}
