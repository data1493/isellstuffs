import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CONVERT_COOKIE_NAME,
  CONVERT_CUBE_LINE,
  CONVERT_FORMAT_LINE,
  CONVERT_GRADE_LINE,
  CONVERT_STILL_LINE,
  CONVERT_TABLE_LINE,
  CONVERT_TOTE_LINE,
  isListingConvertOverlay,
  parseConvertListingIds,
} from "@/lib/listing-convert";
import { listingConvertPath } from "@/lib/paths";

/** PDP banner when this file stays .cube. Does not change the tote. */
export async function ListingConvertNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseConvertListingIds(jar.get(CONVERT_COOKIE_NAME)?.value);

  if (!isListingConvertOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-convert-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't convert"
        title={CONVERT_TABLE_LINE}
        body={`${CONVERT_CUBE_LINE} ${CONVERT_GRADE_LINE} ${CONVERT_FORMAT_LINE} ${CONVERT_STILL_LINE} ${CONVERT_TOTE_LINE}`}
      >
        <Link
          href={listingConvertPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The convert card
        </Link>
      </MallNotice>
    </div>
  );
}
