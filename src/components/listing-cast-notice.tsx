import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CAST_CLAY_LINE,
  CAST_COOKIE_NAME,
  CAST_LIGHTS_LINE,
  CAST_NOTICE_TITLE,
  CAST_STILL_LINE,
  CAST_TABLE_LINE,
  CAST_TOTE_LINE,
  isListingCastOverlay,
  parseCastListingIds,
} from "@/lib/listing-cast";
import { listingCastPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-recast. Does not change the tote. */
export async function ListingCastNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseCastListingIds(jar.get(CAST_COOKIE_NAME)?.value);

  if (!isListingCastOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-cast-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={CAST_TABLE_LINE}
        title={CAST_NOTICE_TITLE}
        body={`${CAST_CLAY_LINE} ${CAST_LIGHTS_LINE} ${CAST_STILL_LINE} ${CAST_TOTE_LINE}`}
      >
        <Link
          href={listingCastPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The cast card
        </Link>
      </MallNotice>
    </div>
  );
}
