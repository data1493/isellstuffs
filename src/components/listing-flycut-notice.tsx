import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  FLYCUT_COOKIE_NAME,
  FLYCUT_LID_LINE,
  FLYCUT_NOTICE_TITLE,
  FLYCUT_POT_LINE,
  FLYCUT_STILL_LINE,
  FLYCUT_TABLE_LINE,
  FLYCUT_TOTE_LINE,
  isListingFlycutOverlay,
  parseFlycutListingIds,
} from "@/lib/listing-flycut";
import { listingFlycutPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-flycut-it. Reads the cookie only. */
export async function ListingFlycutNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseFlycutListingIds(jar.get(FLYCUT_COOKIE_NAME)?.value);

  if (!isListingFlycutOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-flycut-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={FLYCUT_TABLE_LINE}
        title={FLYCUT_NOTICE_TITLE}
        body={`${FLYCUT_LID_LINE} ${FLYCUT_POT_LINE} ${FLYCUT_STILL_LINE} ${FLYCUT_TOTE_LINE}`}
      >
        <Link
          href={listingFlycutPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The flycut card
        </Link>
      </MallNotice>
    </div>
  );
}
