import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  WRONG_COOKIE_NAME,
  WRONG_LINER_LINE,
  WRONG_SCAN_LINE,
  WRONG_STILL_LINE,
  WRONG_TABLE_LINE,
  WRONG_TOTE_LINE,
  isListingWrongOverlay,
  parseWrongListingIds,
} from "@/lib/listing-wrong";
import { listingWrongPath } from "@/lib/paths";

/** PDP banner when the Side A liner stays wrong. Does not change the tote. */
export async function ListingWrongNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseWrongListingIds(jar.get(WRONG_COOKIE_NAME)?.value);

  if (!isListingWrongOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-wrong-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Wrong on purpose"
        title={WRONG_TABLE_LINE}
        body={`${WRONG_SCAN_LINE} ${WRONG_LINER_LINE} ${WRONG_STILL_LINE} ${WRONG_TOTE_LINE}`}
      >
        <Link
          href={listingWrongPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The liner card
        </Link>
      </MallNotice>
    </div>
  );
}
