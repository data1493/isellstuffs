import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SOAK_COOKIE_NAME,
  SOAK_CRACK_LINE,
  SOAK_NOTICE_TITLE,
  SOAK_STILL_LINE,
  SOAK_TABLE_LINE,
  SOAK_TETRIS_LINE,
  SOAK_TOTE_LINE,
  isListingSoakOverlay,
  parseSoakListingIds,
} from "@/lib/listing-soak";
import { listingSoakPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-soak-it. Reads the cookie only. */
export async function ListingSoakNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseSoakListingIds(jar.get(SOAK_COOKIE_NAME)?.value);

  if (!isListingSoakOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-soak-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SOAK_TABLE_LINE}
        title={SOAK_NOTICE_TITLE}
        body={`${SOAK_CRACK_LINE} ${SOAK_TETRIS_LINE} ${SOAK_STILL_LINE} ${SOAK_TOTE_LINE}`}
      >
        <Link
          href={listingSoakPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The soak card
        </Link>
      </MallNotice>
    </div>
  );
}
