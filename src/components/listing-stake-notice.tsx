import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  STAKE_COOKIE_NAME,
  STAKE_LID_LINE,
  STAKE_NOTICE_TITLE,
  STAKE_POT_LINE,
  STAKE_STILL_LINE,
  STAKE_TABLE_LINE,
  STAKE_TOTE_LINE,
  isListingStakeOverlay,
  parseStakeListingIds,
} from "@/lib/listing-stake";
import { listingStakePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-stake-it. Reads the cookie only. */
export async function ListingStakeNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseStakeListingIds(jar.get(STAKE_COOKIE_NAME)?.value);

  if (!isListingStakeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-stake-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={STAKE_TABLE_LINE}
        title={STAKE_NOTICE_TITLE}
        body={`${STAKE_LID_LINE} ${STAKE_POT_LINE} ${STAKE_STILL_LINE} ${STAKE_TOTE_LINE}`}
      >
        <Link
          href={listingStakePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The stake card
        </Link>
      </MallNotice>
    </div>
  );
}
