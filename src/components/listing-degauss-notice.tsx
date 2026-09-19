import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  DEGAUSS_COOKIE_NAME,
  DEGAUSS_HISS_LINE,
  DEGAUSS_INK_LINE,
  DEGAUSS_NOTICE_TITLE,
  DEGAUSS_STILL_LINE,
  DEGAUSS_TABLE_LINE,
  DEGAUSS_TOTE_LINE,
  isListingDegaussOverlay,
  parseDegaussListingIds,
} from "@/lib/listing-degauss";
import { listingDegaussPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-degauss-it. Reads the cookie only. */
export async function ListingDegaussNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseDegaussListingIds(jar.get(DEGAUSS_COOKIE_NAME)?.value);

  if (!isListingDegaussOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-degauss-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={DEGAUSS_TABLE_LINE}
        title={DEGAUSS_NOTICE_TITLE}
        body={`${DEGAUSS_HISS_LINE} ${DEGAUSS_INK_LINE} ${DEGAUSS_STILL_LINE} ${DEGAUSS_TOTE_LINE}`}
      >
        <Link
          href={listingDegaussPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The degauss card
        </Link>
      </MallNotice>
    </div>
  );
}
