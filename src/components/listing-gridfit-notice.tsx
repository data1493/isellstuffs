import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GRIDFIT_BOLD_LINE,
  GRIDFIT_COOKIE_NAME,
  GRIDFIT_NOTICE_TITLE,
  GRIDFIT_STILL_LINE,
  GRIDFIT_TABLE_LINE,
  GRIDFIT_TOTE_LINE,
  GRIDFIT_WEIGHTS_LINE,
  isListingGridfitOverlay,
  parseGridfitListingIds,
} from "@/lib/listing-gridfit";
import { listingGridfitPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-gridfit-it. Reads the cookie only. */
export async function ListingGridfitNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseGridfitListingIds(jar.get(GRIDFIT_COOKIE_NAME)?.value);

  if (!isListingGridfitOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-gridfit-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GRIDFIT_TABLE_LINE}
        title={GRIDFIT_NOTICE_TITLE}
        body={`${GRIDFIT_WEIGHTS_LINE} ${GRIDFIT_BOLD_LINE} ${GRIDFIT_STILL_LINE} ${GRIDFIT_TOTE_LINE}`}
      >
        <Link
          href={listingGridfitPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The gridfit card
        </Link>
      </MallNotice>
    </div>
  );
}
