import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SINGE_COOKIE_NAME,
  SINGE_HOLE_LINE,
  SINGE_JACKET_LINE,
  SINGE_NOTICE_TITLE,
  SINGE_STILL_LINE,
  SINGE_TABLE_LINE,
  SINGE_TOTE_LINE,
  isListingSingeOverlay,
  parseSingeListingIds,
} from "@/lib/listing-singe";
import { listingSingePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-singe-it. Reads the cookie only. */
export async function ListingSingeNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseSingeListingIds(jar.get(SINGE_COOKIE_NAME)?.value);

  if (!isListingSingeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-singe-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SINGE_TABLE_LINE}
        title={SINGE_NOTICE_TITLE}
        body={`${SINGE_JACKET_LINE} ${SINGE_HOLE_LINE} ${SINGE_STILL_LINE} ${SINGE_TOTE_LINE}`}
      >
        <Link
          href={listingSingePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The singe card
        </Link>
      </MallNotice>
    </div>
  );
}
