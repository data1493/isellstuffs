import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SATURATE_COOKIE_NAME,
  SATURATE_NOTICE_TITLE,
  SATURATE_SHOTS_LINE,
  SATURATE_STILL_LINE,
  SATURATE_TABLE_LINE,
  SATURATE_TOTE_LINE,
  SATURATE_ZIP_LINE,
  isListingSaturateOverlay,
  parseSaturateListingIds,
} from "@/lib/listing-saturate";
import { listingSaturatePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-saturate-them. Reads the cookie only. */
export async function ListingSaturateNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseSaturateListingIds(jar.get(SATURATE_COOKIE_NAME)?.value);

  if (!isListingSaturateOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-saturate-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SATURATE_TABLE_LINE}
        title={SATURATE_NOTICE_TITLE}
        body={`${SATURATE_SHOTS_LINE} ${SATURATE_ZIP_LINE} ${SATURATE_STILL_LINE} ${SATURATE_TOTE_LINE}`}
      >
        <Link
          href={listingSaturatePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The saturate card
        </Link>
      </MallNotice>
    </div>
  );
}
