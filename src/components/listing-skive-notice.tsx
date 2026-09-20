import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SKIVE_COOKIE_NAME,
  SKIVE_NOTICE_TITLE,
  SKIVE_PAIR_LINE,
  SKIVE_PEEL_LINE,
  SKIVE_STILL_LINE,
  SKIVE_TABLE_LINE,
  SKIVE_TOTE_LINE,
  isListingSkiveOverlay,
  parseSkiveListingIds,
} from "@/lib/listing-skive";
import { listingSkivePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-skive-it. Reads the cookie only. */
export async function ListingSkiveNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseSkiveListingIds(jar.get(SKIVE_COOKIE_NAME)?.value);

  if (!isListingSkiveOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-skive-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SKIVE_TABLE_LINE}
        title={SKIVE_NOTICE_TITLE}
        body={`${SKIVE_PEEL_LINE} ${SKIVE_PAIR_LINE} ${SKIVE_STILL_LINE} ${SKIVE_TOTE_LINE}`}
      >
        <Link
          href={listingSkivePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The skive card
        </Link>
      </MallNotice>
    </div>
  );
}
