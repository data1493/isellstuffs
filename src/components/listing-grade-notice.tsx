import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GRADE_COOKIE_NAME,
  GRADE_SCAN_LINE,
  GRADE_SHOT_LINE,
  GRADE_STICK_LINE,
  GRADE_STILL_LINE,
  GRADE_TABLE_LINE,
  GRADE_TOTE_LINE,
  isListingGradeOverlay,
  parseGradeListingIds,
} from "@/lib/listing-grade";
import { listingGradePath } from "@/lib/paths";

/** PDP banner when this file stays as-shot. Does not change the tote. */
export async function ListingGradeNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseGradeListingIds(jar.get(GRADE_COOKIE_NAME)?.value);

  if (!isListingGradeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-grade-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't grade your lot"
        title={GRADE_TABLE_LINE}
        body={`${GRADE_SHOT_LINE} ${GRADE_STICK_LINE} ${GRADE_STILL_LINE} ${GRADE_TOTE_LINE} ${GRADE_SCAN_LINE}`}
      >
        <Link
          href={listingGradePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The grade card
        </Link>
      </MallNotice>
    </div>
  );
}
