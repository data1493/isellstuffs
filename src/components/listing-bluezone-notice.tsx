import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BLUEZONE_BOLD_LINE,
  BLUEZONE_COOKIE_NAME,
  BLUEZONE_NOTICE_TITLE,
  BLUEZONE_STILL_LINE,
  BLUEZONE_TABLE_LINE,
  BLUEZONE_TOTE_LINE,
  BLUEZONE_WEIGHTS_LINE,
  isListingBluezoneOverlay,
  parseBluezoneListingIds,
} from "@/lib/listing-bluezone";
import { listingBluezonePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-bluezone-it. Reads the cookie only. */
export async function ListingBluezoneNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseBluezoneListingIds(jar.get(BLUEZONE_COOKIE_NAME)?.value);

  if (!isListingBluezoneOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-bluezone-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BLUEZONE_TABLE_LINE}
        title={BLUEZONE_NOTICE_TITLE}
        body={`${BLUEZONE_WEIGHTS_LINE} ${BLUEZONE_BOLD_LINE} ${BLUEZONE_STILL_LINE} ${BLUEZONE_TOTE_LINE}`}
      >
        <Link
          href={listingBluezonePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The bluezone card
        </Link>
      </MallNotice>
    </div>
  );
}
