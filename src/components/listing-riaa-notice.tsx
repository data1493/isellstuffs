import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  RIAA_COOKIE_NAME,
  RIAA_NOTICE_TITLE,
  RIAA_SKIP_LINE,
  RIAA_STILL_LINE,
  RIAA_TABLE_LINE,
  RIAA_TOTE_LINE,
  RIAA_UNNAMED_LINE,
  isListingRiaaOverlay,
  parseRiaaListingIds,
} from "@/lib/listing-riaa";
import { listingRiaaPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-riaa-it. Reads the cookie only. */
export async function ListingRiaaNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseRiaaListingIds(jar.get(RIAA_COOKIE_NAME)?.value);

  if (!isListingRiaaOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-riaa-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={RIAA_TABLE_LINE}
        title={RIAA_NOTICE_TITLE}
        body={`${RIAA_SKIP_LINE} ${RIAA_UNNAMED_LINE} ${RIAA_STILL_LINE} ${RIAA_TOTE_LINE}`}
      >
        <Link
          href={listingRiaaPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The riaa card
        </Link>
      </MallNotice>
    </div>
  );
}
