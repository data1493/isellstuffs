import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GLUE_CELLS_LINE,
  GLUE_COOKIE_NAME,
  GLUE_LINE_LINE,
  GLUE_NOTICE_TITLE,
  GLUE_PRESS_LINE,
  GLUE_STILL_LINE,
  GLUE_TABLE_LINE,
  GLUE_TOTE_LINE,
  isListingGlueOverlay,
  parseGlueListingIds,
} from "@/lib/listing-glue";
import { listingGluePath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-glue. Does not change the tote. */
export async function ListingGlueNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseGlueListingIds(jar.get(GLUE_COOKIE_NAME)?.value);

  if (!isListingGlueOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-glue-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GLUE_TABLE_LINE}
        title={GLUE_NOTICE_TITLE}
        body={`${GLUE_PRESS_LINE} ${GLUE_LINE_LINE} ${GLUE_CELLS_LINE} ${GLUE_STILL_LINE} ${GLUE_TOTE_LINE}`}
      >
        <Link
          href={listingGluePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The glue card
        </Link>
      </MallNotice>
    </div>
  );
}
