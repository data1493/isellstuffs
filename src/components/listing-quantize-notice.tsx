import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  QUANTIZE_COOKIE_NAME,
  QUANTIZE_NOTICE_TITLE,
  QUANTIZE_SHOTS_LINE,
  QUANTIZE_STILL_LINE,
  QUANTIZE_TABLE_LINE,
  QUANTIZE_TOTE_LINE,
  QUANTIZE_ZIP_LINE,
  isListingQuantizeOverlay,
  parseQuantizeListingIds,
} from "@/lib/listing-quantize";
import { listingQuantizePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-quantize-them. Reads the cookie only. */
export async function ListingQuantizeNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseQuantizeListingIds(jar.get(QUANTIZE_COOKIE_NAME)?.value);

  if (!isListingQuantizeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-quantize-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={QUANTIZE_TABLE_LINE}
        title={QUANTIZE_NOTICE_TITLE}
        body={`${QUANTIZE_SHOTS_LINE} ${QUANTIZE_ZIP_LINE} ${QUANTIZE_STILL_LINE} ${QUANTIZE_TOTE_LINE}`}
      >
        <Link
          href={listingQuantizePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The quantize card
        </Link>
      </MallNotice>
    </div>
  );
}
