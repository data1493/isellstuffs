import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  DART_CAR_LINE,
  DART_COOKIE_NAME,
  DART_NOTICE_TITLE,
  DART_STILL_LINE,
  DART_TABLE_LINE,
  DART_TOTE_LINE,
  DART_WORN_LINE,
  isListingDartOverlay,
  parseDartListingIds,
} from "@/lib/listing-dart";
import { listingDartPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-dart-it. Reads the cookie only. */
export async function ListingDartNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseDartListingIds(jar.get(DART_COOKIE_NAME)?.value);

  if (!isListingDartOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-dart-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={DART_TABLE_LINE}
        title={DART_NOTICE_TITLE}
        body={`${DART_WORN_LINE} ${DART_CAR_LINE} ${DART_STILL_LINE} ${DART_TOTE_LINE}`}
      >
        <Link
          href={listingDartPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The dart card
        </Link>
      </MallNotice>
    </div>
  );
}
