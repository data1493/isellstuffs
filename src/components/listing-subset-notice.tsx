import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SUBSET_COOKIE_NAME,
  SUBSET_NOTICE_TITLE,
  SUBSET_OTF_LINE,
  SUBSET_STILL_LINE,
  SUBSET_TABLE_LINE,
  SUBSET_TOTE_LINE,
  SUBSET_WEIGHTS_LINE,
  isListingSubsetOverlay,
  parseSubsetListingIds,
} from "@/lib/listing-subset";
import { listingSubsetPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-subset-it. Reads the cookie only. */
export async function ListingSubsetNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseSubsetListingIds(jar.get(SUBSET_COOKIE_NAME)?.value);

  if (!isListingSubsetOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-subset-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SUBSET_TABLE_LINE}
        title={SUBSET_NOTICE_TITLE}
        body={`${SUBSET_WEIGHTS_LINE} ${SUBSET_OTF_LINE} ${SUBSET_STILL_LINE} ${SUBSET_TOTE_LINE}`}
      >
        <Link
          href={listingSubsetPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The subset card
        </Link>
      </MallNotice>
    </div>
  );
}
