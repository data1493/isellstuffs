import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BUSH_COOKIE_NAME,
  BUSH_LIGHTS_LINE,
  BUSH_NOTICE_TITLE,
  BUSH_STILL_LINE,
  BUSH_TABLE_LINE,
  BUSH_TOTE_LINE,
  BUSH_WOBBLE_LINE,
  isListingBushOverlay,
  parseBushListingIds,
} from "@/lib/listing-bush";
import { listingBushPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-bush-it. Reads the cookie only. */
export async function ListingBushNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseBushListingIds(jar.get(BUSH_COOKIE_NAME)?.value);

  if (!isListingBushOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-bush-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BUSH_TABLE_LINE}
        title={BUSH_NOTICE_TITLE}
        body={`${BUSH_WOBBLE_LINE} ${BUSH_LIGHTS_LINE} ${BUSH_STILL_LINE} ${BUSH_TOTE_LINE}`}
      >
        <Link
          href={listingBushPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The bush card
        </Link>
      </MallNotice>
    </div>
  );
}
