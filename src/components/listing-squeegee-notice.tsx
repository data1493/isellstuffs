import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SQUEEGEE_COOKIE_NAME,
  SQUEEGEE_CRACK_LINE,
  SQUEEGEE_NOTICE_TITLE,
  SQUEEGEE_STILL_LINE,
  SQUEEGEE_TABLE_LINE,
  SQUEEGEE_TETRIS_LINE,
  SQUEEGEE_TOTE_LINE,
  isListingSqueegeeOverlay,
  parseSqueegeeListingIds,
} from "@/lib/listing-squeegee";
import { listingSqueegeePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-squeegee-it. Reads the cookie only. */
export async function ListingSqueegeeNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseSqueegeeListingIds(jar.get(SQUEEGEE_COOKIE_NAME)?.value);

  if (!isListingSqueegeeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-squeegee-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SQUEEGEE_TABLE_LINE}
        title={SQUEEGEE_NOTICE_TITLE}
        body={`${SQUEEGEE_CRACK_LINE} ${SQUEEGEE_TETRIS_LINE} ${SQUEEGEE_STILL_LINE} ${SQUEEGEE_TOTE_LINE}`}
      >
        <Link
          href={listingSqueegeePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The squeegee card
        </Link>
      </MallNotice>
    </div>
  );
}
