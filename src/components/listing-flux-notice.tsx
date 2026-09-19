import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  FLUX_COOKIE_NAME,
  FLUX_NOTICE_TITLE,
  FLUX_STILL_LINE,
  FLUX_TABLE_LINE,
  FLUX_TANGLE_LINE,
  FLUX_TOTE_LINE,
  FLUX_UNTESTED_LINE,
  isListingFluxOverlay,
  parseFluxListingIds,
} from "@/lib/listing-flux";
import { listingFluxPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-flux-them. Reads the cookie only. */
export async function ListingFluxNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseFluxListingIds(jar.get(FLUX_COOKIE_NAME)?.value);

  if (!isListingFluxOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-flux-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={FLUX_TABLE_LINE}
        title={FLUX_NOTICE_TITLE}
        body={`${FLUX_TANGLE_LINE} ${FLUX_UNTESTED_LINE} ${FLUX_STILL_LINE} ${FLUX_TOTE_LINE}`}
      >
        <Link
          href={listingFluxPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The flux card
        </Link>
      </MallNotice>
    </div>
  );
}
