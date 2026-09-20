import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  AVAR_BOLD_LINE,
  AVAR_COOKIE_NAME,
  AVAR_NOTICE_TITLE,
  AVAR_STILL_LINE,
  AVAR_TABLE_LINE,
  AVAR_TOTE_LINE,
  AVAR_WEIGHTS_LINE,
  isListingAvarOverlay,
  parseAvarListingIds,
} from "@/lib/listing-avar";
import { listingAvarPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-avar-it. Reads the cookie only. */
export async function ListingAvarNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseAvarListingIds(jar.get(AVAR_COOKIE_NAME)?.value);

  if (!isListingAvarOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-avar-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={AVAR_TABLE_LINE}
        title={AVAR_NOTICE_TITLE}
        body={`${AVAR_WEIGHTS_LINE} ${AVAR_BOLD_LINE} ${AVAR_STILL_LINE} ${AVAR_TOTE_LINE}`}
      >
        <Link
          href={listingAvarPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The avar card
        </Link>
      </MallNotice>
    </div>
  );
}
