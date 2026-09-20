import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  OPSZ_BOLD_LINE,
  OPSZ_COOKIE_NAME,
  OPSZ_NOTICE_TITLE,
  OPSZ_STILL_LINE,
  OPSZ_TABLE_LINE,
  OPSZ_TOTE_LINE,
  OPSZ_WEIGHTS_LINE,
  isListingOpszOverlay,
  parseOpszListingIds,
} from "@/lib/listing-opsz";
import { listingOpszPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-opsz-it. Reads the cookie only. */
export async function ListingOpszNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseOpszListingIds(jar.get(OPSZ_COOKIE_NAME)?.value);

  if (!isListingOpszOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-opsz-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={OPSZ_TABLE_LINE}
        title={OPSZ_NOTICE_TITLE}
        body={`${OPSZ_WEIGHTS_LINE} ${OPSZ_BOLD_LINE} ${OPSZ_STILL_LINE} ${OPSZ_TOTE_LINE}`}
      >
        <Link
          href={listingOpszPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The opsz card
        </Link>
      </MallNotice>
    </div>
  );
}
