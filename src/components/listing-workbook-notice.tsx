import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  WORKBOOK_COOKIE_NAME,
  WORKBOOK_FILE_LINE,
  WORKBOOK_GRADE_LINE,
  WORKBOOK_SCAN_LINE,
  WORKBOOK_STILL_LINE,
  WORKBOOK_TABLE_LINE,
  WORKBOOK_TOTE_LINE,
  isListingWorkbookOverlay,
  parseWorkbookListingIds,
} from "@/lib/listing-workbook";
import { listingWorkbookPath } from "@/lib/paths";

/** PDP banner when this file has no companion book. Does not change the tote. */
export async function ListingWorkbookNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseWorkbookListingIds(jar.get(WORKBOOK_COOKIE_NAME)?.value);

  if (!isListingWorkbookOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-workbook-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="There is no workbook"
        title={WORKBOOK_TABLE_LINE}
        body={`${WORKBOOK_FILE_LINE} ${WORKBOOK_GRADE_LINE} ${WORKBOOK_STILL_LINE} ${WORKBOOK_TOTE_LINE} ${WORKBOOK_SCAN_LINE}`}
      >
        <Link
          href={listingWorkbookPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The workbook card
        </Link>
      </MallNotice>
    </div>
  );
}
