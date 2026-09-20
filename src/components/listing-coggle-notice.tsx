import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  COGGLE_COFFEE_LINE,
  COGGLE_COOKIE_NAME,
  COGGLE_NOTICE_TITLE,
  COGGLE_RIM_LINE,
  COGGLE_STILL_LINE,
  COGGLE_TABLE_LINE,
  COGGLE_TOTE_LINE,
  isListingCoggleOverlay,
  parseCoggleListingIds,
} from "@/lib/listing-coggle";
import { listingCogglePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-coggle-it. Reads the cookie only. */
export async function ListingCoggleNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseCoggleListingIds(jar.get(COGGLE_COOKIE_NAME)?.value);

  if (!isListingCoggleOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-coggle-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={COGGLE_TABLE_LINE}
        title={COGGLE_NOTICE_TITLE}
        body={`${COGGLE_RIM_LINE} ${COGGLE_COFFEE_LINE} ${COGGLE_STILL_LINE} ${COGGLE_TOTE_LINE}`}
      >
        <Link
          href={listingCogglePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The coggle card
        </Link>
      </MallNotice>
    </div>
  );
}
