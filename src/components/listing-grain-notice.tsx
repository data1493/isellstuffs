import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GRAIN_COOKIE_NAME,
  GRAIN_CUBE_LINE,
  GRAIN_LOOKS_LINE,
  GRAIN_NOTICE_TITLE,
  GRAIN_STILL_LINE,
  GRAIN_TABLE_LINE,
  GRAIN_TOTE_LINE,
  isListingGrainOverlay,
  parseGrainListingIds,
} from "@/lib/listing-grain";
import { listingGrainPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-grain-them. Reads the cookie only. */
export async function ListingGrainNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseGrainListingIds(jar.get(GRAIN_COOKIE_NAME)?.value);

  if (!isListingGrainOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-grain-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GRAIN_TABLE_LINE}
        title={GRAIN_NOTICE_TITLE}
        body={`${GRAIN_LOOKS_LINE} ${GRAIN_CUBE_LINE} ${GRAIN_STILL_LINE} ${GRAIN_TOTE_LINE}`}
      >
        <Link
          href={listingGrainPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The grain card
        </Link>
      </MallNotice>
    </div>
  );
}
