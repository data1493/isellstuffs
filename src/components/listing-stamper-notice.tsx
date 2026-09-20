import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  STAMPER_COOKIE_NAME,
  STAMPER_JEWEL_LINE,
  STAMPER_NOTICE_TITLE,
  STAMPER_SHARPIE_LINE,
  STAMPER_STILL_LINE,
  STAMPER_TABLE_LINE,
  STAMPER_TOTE_LINE,
  isListingStamperOverlay,
  parseStamperListingIds,
} from "@/lib/listing-stamper";
import { listingStamperPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-stamper-it. Reads the cookie only. */
export async function ListingStamperNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseStamperListingIds(jar.get(STAMPER_COOKIE_NAME)?.value);

  if (!isListingStamperOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-stamper-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={STAMPER_TABLE_LINE}
        title={STAMPER_NOTICE_TITLE}
        body={`${STAMPER_SHARPIE_LINE} ${STAMPER_JEWEL_LINE} ${STAMPER_STILL_LINE} ${STAMPER_TOTE_LINE}`}
      >
        <Link
          href={listingStamperPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The stamper card
        </Link>
      </MallNotice>
    </div>
  );
}
