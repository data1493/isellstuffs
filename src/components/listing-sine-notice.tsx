import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SINE_COOKIE_NAME,
  SINE_LID_LINE,
  SINE_NOTICE_TITLE,
  SINE_POT_LINE,
  SINE_STILL_LINE,
  SINE_TABLE_LINE,
  SINE_TOTE_LINE,
  isListingSineOverlay,
  parseSineListingIds,
} from "@/lib/listing-sine";
import { listingSinePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-sine-it. Reads the cookie only. */
export async function ListingSineNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseSineListingIds(jar.get(SINE_COOKIE_NAME)?.value);

  if (!isListingSineOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-sine-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SINE_TABLE_LINE}
        title={SINE_NOTICE_TITLE}
        body={`${SINE_LID_LINE} ${SINE_POT_LINE} ${SINE_STILL_LINE} ${SINE_TOTE_LINE}`}
      >
        <Link
          href={listingSinePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The sine card
        </Link>
      </MallNotice>
    </div>
  );
}
