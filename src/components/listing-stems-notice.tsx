import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  STEMS_COOKIE_NAME,
  STEMS_FOLDER_LINE,
  STEMS_GRADE_LINE,
  STEMS_PACK_LINE,
  STEMS_STILL_LINE,
  STEMS_TABLE_LINE,
  STEMS_TOTE_LINE,
  isListingStemsOverlay,
  parseStemsListingIds,
} from "@/lib/listing-stems";
import { listingStemsPath } from "@/lib/paths";

/** PDP banner when this file is twelve shots, not a stem kit. Does not change the tote. */
export async function ListingStemsNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseStemsListingIds(jar.get(STEMS_COOKIE_NAME)?.value);

  if (!isListingStemsOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-stems-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="These twelve shots"
        title={STEMS_TABLE_LINE}
        body={`${STEMS_PACK_LINE} ${STEMS_GRADE_LINE} ${STEMS_STILL_LINE} ${STEMS_TOTE_LINE} ${STEMS_FOLDER_LINE}`}
      >
        <Link
          href={listingStemsPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The shot-count card
        </Link>
      </MallNotice>
    </div>
  );
}
