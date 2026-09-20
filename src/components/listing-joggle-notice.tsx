import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  JOGGLE_BENT_LINE,
  JOGGLE_COOKIE_NAME,
  JOGGLE_METAL_LINE,
  JOGGLE_NOTICE_TITLE,
  JOGGLE_STILL_LINE,
  JOGGLE_TABLE_LINE,
  JOGGLE_TOTE_LINE,
  isListingJoggleOverlay,
  parseJoggleListingIds,
} from "@/lib/listing-joggle";
import { listingJogglePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-joggle-it. Reads the cookie only. */
export async function ListingJoggleNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseJoggleListingIds(jar.get(JOGGLE_COOKIE_NAME)?.value);

  if (!isListingJoggleOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-joggle-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={JOGGLE_TABLE_LINE}
        title={JOGGLE_NOTICE_TITLE}
        body={`${JOGGLE_BENT_LINE} ${JOGGLE_METAL_LINE} ${JOGGLE_STILL_LINE} ${JOGGLE_TOTE_LINE}`}
      >
        <Link
          href={listingJogglePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The joggle card
        </Link>
      </MallNotice>
    </div>
  );
}
