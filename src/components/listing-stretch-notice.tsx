import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  STRETCH_COOKIE_NAME,
  STRETCH_LACES_LINE,
  STRETCH_NOTICE_TITLE,
  STRETCH_SOLE_LINE,
  STRETCH_STILL_LINE,
  STRETCH_TABLE_LINE,
  STRETCH_TOTE_LINE,
  isListingStretchOverlay,
  parseStretchListingIds,
} from "@/lib/listing-stretch";
import { listingStretchPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-stretch. Does not change the tote. */
export async function ListingStretchNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseStretchListingIds(jar.get(STRETCH_COOKIE_NAME)?.value);

  if (!isListingStretchOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-stretch-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={STRETCH_TABLE_LINE}
        title={STRETCH_NOTICE_TITLE}
        body={`${STRETCH_SOLE_LINE} ${STRETCH_LACES_LINE} ${STRETCH_STILL_LINE} ${STRETCH_TOTE_LINE}`}
      >
        <Link
          href={listingStretchPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The stretch card
        </Link>
      </MallNotice>
    </div>
  );
}
