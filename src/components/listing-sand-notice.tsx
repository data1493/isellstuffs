import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SAND_CHIP_LINE,
  SAND_COOKIE_NAME,
  SAND_MUG_LINE,
  SAND_NOTICE_TITLE,
  SAND_STILL_LINE,
  SAND_TABLE_LINE,
  SAND_TOTE_LINE,
  isListingSandOverlay,
  parseSandListingIds,
} from "@/lib/listing-sand";
import { listingSandPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-sand-it. Reads the cookie only. */
export async function ListingSandNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseSandListingIds(jar.get(SAND_COOKIE_NAME)?.value);

  if (!isListingSandOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-sand-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SAND_TABLE_LINE}
        title={SAND_NOTICE_TITLE}
        body={`${SAND_CHIP_LINE} ${SAND_MUG_LINE} ${SAND_STILL_LINE} ${SAND_TOTE_LINE}`}
      >
        <Link
          href={listingSandPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The sand card
        </Link>
      </MallNotice>
    </div>
  );
}
