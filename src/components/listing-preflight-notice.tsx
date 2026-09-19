import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PREFLIGHT_COOKIE_NAME,
  PREFLIGHT_NOTICE_TITLE,
  PREFLIGHT_PAGE_LINE,
  PREFLIGHT_PDF_LINE,
  PREFLIGHT_STILL_LINE,
  PREFLIGHT_TABLE_LINE,
  PREFLIGHT_TOTE_LINE,
  isListingPreflightOverlay,
  parsePreflightListingIds,
} from "@/lib/listing-preflight";
import { listingPreflightPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-preflight-it. Reads the cookie only. */
export async function ListingPreflightNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parsePreflightListingIds(jar.get(PREFLIGHT_COOKIE_NAME)?.value);

  if (!isListingPreflightOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-preflight-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PREFLIGHT_TABLE_LINE}
        title={PREFLIGHT_NOTICE_TITLE}
        body={`${PREFLIGHT_PAGE_LINE} ${PREFLIGHT_PDF_LINE} ${PREFLIGHT_STILL_LINE} ${PREFLIGHT_TOTE_LINE}`}
      >
        <Link
          href={listingPreflightPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The preflight card
        </Link>
      </MallNotice>
    </div>
  );
}
