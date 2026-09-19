import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  POLISH_COOKIE_NAME,
  POLISH_NOTICE_TITLE,
  POLISH_PLAYS_LINE,
  POLISH_SCRATCH_LINE,
  POLISH_STILL_LINE,
  POLISH_TABLE_LINE,
  POLISH_TOTE_LINE,
  POLISH_ZIP_LINE,
  isListingPolishOverlay,
  parsePolishListingIds,
} from "@/lib/listing-polish";
import { listingPolishPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-polish. Does not change the tote. */
export async function ListingPolishNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parsePolishListingIds(jar.get(POLISH_COOKIE_NAME)?.value);

  if (!isListingPolishOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-polish-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={POLISH_TABLE_LINE}
        title={POLISH_NOTICE_TITLE}
        body={`${POLISH_SCRATCH_LINE} ${POLISH_ZIP_LINE} ${POLISH_PLAYS_LINE} ${POLISH_STILL_LINE} ${POLISH_TOTE_LINE}`}
      >
        <Link
          href={listingPolishPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The polish card
        </Link>
      </MallNotice>
    </div>
  );
}
