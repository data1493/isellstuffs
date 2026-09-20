import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  FIZEAU_COOKIE_NAME,
  FIZEAU_LID_LINE,
  FIZEAU_NOTICE_TITLE,
  FIZEAU_POT_LINE,
  FIZEAU_STILL_LINE,
  FIZEAU_TABLE_LINE,
  FIZEAU_TOTE_LINE,
  isListingFizeauOverlay,
  parseFizeauListingIds,
} from "@/lib/listing-fizeau";
import { listingFizeauPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-fizeau-it. Reads the cookie only. */
export async function ListingFizeauNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseFizeauListingIds(jar.get(FIZEAU_COOKIE_NAME)?.value);

  if (!isListingFizeauOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-fizeau-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={FIZEAU_TABLE_LINE}
        title={FIZEAU_NOTICE_TITLE}
        body={`${FIZEAU_LID_LINE} ${FIZEAU_POT_LINE} ${FIZEAU_STILL_LINE} ${FIZEAU_TOTE_LINE}`}
      >
        <Link
          href={listingFizeauPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The fizeau card
        </Link>
      </MallNotice>
    </div>
  );
}
