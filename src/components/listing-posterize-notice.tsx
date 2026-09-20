import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  POSTERIZE_COOKIE_NAME,
  POSTERIZE_LOOKS_LINE,
  POSTERIZE_LOT_LINE,
  POSTERIZE_NOTICE_TITLE,
  POSTERIZE_STILL_LINE,
  POSTERIZE_TABLE_LINE,
  POSTERIZE_TOTE_LINE,
  isListingPosterizeOverlay,
  parsePosterizeListingIds,
} from "@/lib/listing-posterize";
import { listingPosterizePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-posterize-them. Reads the cookie only. */
export async function ListingPosterizeNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parsePosterizeListingIds(jar.get(POSTERIZE_COOKIE_NAME)?.value);

  if (!isListingPosterizeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-posterize-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={POSTERIZE_TABLE_LINE}
        title={POSTERIZE_NOTICE_TITLE}
        body={`${POSTERIZE_LOOKS_LINE} ${POSTERIZE_LOT_LINE} ${POSTERIZE_STILL_LINE} ${POSTERIZE_TOTE_LINE}`}
      >
        <Link
          href={listingPosterizePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The posterize card
        </Link>
      </MallNotice>
    </div>
  );
}
