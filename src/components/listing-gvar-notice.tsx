import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GVAR_BOLD_LINE,
  GVAR_COOKIE_NAME,
  GVAR_NOTICE_TITLE,
  GVAR_STILL_LINE,
  GVAR_TABLE_LINE,
  GVAR_TOTE_LINE,
  GVAR_WEIGHTS_LINE,
  isListingGvarOverlay,
  parseGvarListingIds,
} from "@/lib/listing-gvar";
import { listingGvarPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-gvar-it. Reads the cookie only. */
export async function ListingGvarNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseGvarListingIds(jar.get(GVAR_COOKIE_NAME)?.value);

  if (!isListingGvarOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-gvar-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GVAR_TABLE_LINE}
        title={GVAR_NOTICE_TITLE}
        body={`${GVAR_WEIGHTS_LINE} ${GVAR_BOLD_LINE} ${GVAR_STILL_LINE} ${GVAR_TOTE_LINE}`}
      >
        <Link
          href={listingGvarPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The gvar card
        </Link>
      </MallNotice>
    </div>
  );
}
