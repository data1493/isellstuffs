import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  VENT_COOKIE_NAME,
  VENT_LID_LINE,
  VENT_NOTICE_TITLE,
  VENT_STILL_LINE,
  VENT_TABLE_LINE,
  VENT_TOTE_LINE,
  isListingVentOverlay,
  parseVentListingIds,
} from "@/lib/listing-vent";
import { listingVentPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-vent. Does not change the tote. */
export async function ListingVentNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseVentListingIds(jar.get(VENT_COOKIE_NAME)?.value);

  if (!isListingVentOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-vent-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={VENT_TABLE_LINE}
        title={VENT_NOTICE_TITLE}
        body={`${VENT_LID_LINE} ${VENT_STILL_LINE} ${VENT_TOTE_LINE}`}
      >
        <Link
          href={listingVentPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The vent card
        </Link>
      </MallNotice>
    </div>
  );
}
