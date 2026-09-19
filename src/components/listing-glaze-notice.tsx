import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GLAZE_CHIP_LINE,
  GLAZE_COOKIE_NAME,
  GLAZE_MUG_LINE,
  GLAZE_NOTICE_TITLE,
  GLAZE_STILL_LINE,
  GLAZE_TABLE_LINE,
  GLAZE_TOTE_LINE,
  isListingGlazeOverlay,
  parseGlazeListingIds,
} from "@/lib/listing-glaze";
import { listingGlazePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-glaze-it. Reads the cookie only. */
export async function ListingGlazeNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseGlazeListingIds(jar.get(GLAZE_COOKIE_NAME)?.value);

  if (!isListingGlazeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-glaze-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GLAZE_TABLE_LINE}
        title={GLAZE_NOTICE_TITLE}
        body={`${GLAZE_CHIP_LINE} ${GLAZE_MUG_LINE} ${GLAZE_STILL_LINE} ${GLAZE_TOTE_LINE}`}
      >
        <Link
          href={listingGlazePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The glaze card
        </Link>
      </MallNotice>
    </div>
  );
}
