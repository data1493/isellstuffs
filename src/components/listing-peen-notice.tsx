import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PEEN_COOKIE_NAME,
  PEEN_METAL_LINE,
  PEEN_NOTICE_TITLE,
  PEEN_SPLAYED_LINE,
  PEEN_STILL_LINE,
  PEEN_TABLE_LINE,
  PEEN_TOTE_LINE,
  isListingPeenOverlay,
  parsePeenListingIds,
} from "@/lib/listing-peen";
import { listingPeenPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-peen-it. Reads the cookie only. */
export async function ListingPeenNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parsePeenListingIds(jar.get(PEEN_COOKIE_NAME)?.value);

  if (!isListingPeenOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-peen-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PEEN_TABLE_LINE}
        title={PEEN_NOTICE_TITLE}
        body={`${PEEN_SPLAYED_LINE} ${PEEN_METAL_LINE} ${PEEN_STILL_LINE} ${PEEN_TOTE_LINE}`}
      >
        <Link
          href={listingPeenPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The peen card
        </Link>
      </MallNotice>
    </div>
  );
}
