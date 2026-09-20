import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  FLUTTER_COOKIE_NAME,
  FLUTTER_HISS_LINE,
  FLUTTER_NOTICE_TITLE,
  FLUTTER_RADIO_LINE,
  FLUTTER_STILL_LINE,
  FLUTTER_TABLE_LINE,
  FLUTTER_TOTE_LINE,
  isListingFlutterOverlay,
  parseFlutterListingIds,
} from "@/lib/listing-flutter";
import { listingFlutterPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-flutter-it. Reads the cookie only. */
export async function ListingFlutterNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseFlutterListingIds(jar.get(FLUTTER_COOKIE_NAME)?.value);

  if (!isListingFlutterOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-flutter-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={FLUTTER_TABLE_LINE}
        title={FLUTTER_NOTICE_TITLE}
        body={`${FLUTTER_HISS_LINE} ${FLUTTER_RADIO_LINE} ${FLUTTER_STILL_LINE} ${FLUTTER_TOTE_LINE}`}
      >
        <Link
          href={listingFlutterPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The flutter card
        </Link>
      </MallNotice>
    </div>
  );
}
