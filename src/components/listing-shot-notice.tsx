import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SHOT_CAMERA_LINE,
  SHOT_CONVERT_LINE,
  SHOT_COOKIE_NAME,
  SHOT_FILM_LINE,
  SHOT_LOOKS_LINE,
  SHOT_NOTICE_TITLE,
  SHOT_STILL_LINE,
  SHOT_TABLE_LINE,
  SHOT_TOTE_LINE,
  isListingShotOverlay,
  parseShotListingIds,
} from "@/lib/listing-shot";
import { listingShotPath } from "@/lib/paths";

/** PDP banner when this file is taped I-don't-shoot. Does not change the tote. */
export async function ListingShotNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseShotListingIds(jar.get(SHOT_COOKIE_NAME)?.value);

  if (!isListingShotOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-shot-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SHOT_TABLE_LINE}
        title={SHOT_NOTICE_TITLE}
        body={`${SHOT_CAMERA_LINE} ${SHOT_LOOKS_LINE} ${SHOT_CONVERT_LINE} ${SHOT_FILM_LINE} ${SHOT_STILL_LINE} ${SHOT_TOTE_LINE}`}
      >
        <Link
          href={listingShotPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The shot card
        </Link>
      </MallNotice>
    </div>
  );
}
