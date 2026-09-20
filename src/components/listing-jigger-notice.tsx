import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  JIGGER_COOKIE_NAME,
  JIGGER_COFFEE_LINE,
  JIGGER_NOTICE_TITLE,
  JIGGER_RIM_LINE,
  JIGGER_STILL_LINE,
  JIGGER_TABLE_LINE,
  JIGGER_TOTE_LINE,
  isListingJiggerOverlay,
  parseJiggerListingIds,
} from "@/lib/listing-jigger";
import { listingJiggerPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-jigger-it. Reads the cookie only. */
export async function ListingJiggerNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseJiggerListingIds(jar.get(JIGGER_COOKIE_NAME)?.value);

  if (!isListingJiggerOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-jigger-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={JIGGER_TABLE_LINE}
        title={JIGGER_NOTICE_TITLE}
        body={`${JIGGER_RIM_LINE} ${JIGGER_COFFEE_LINE} ${JIGGER_STILL_LINE} ${JIGGER_TOTE_LINE}`}
      >
        <Link
          href={listingJiggerPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The jigger card
        </Link>
      </MallNotice>
    </div>
  );
}
