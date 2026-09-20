import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GAMUT_COOKIE_NAME,
  GAMUT_FLUOR_LINE,
  GAMUT_LOT_LINE,
  GAMUT_NOTICE_TITLE,
  GAMUT_STILL_LINE,
  GAMUT_TABLE_LINE,
  GAMUT_TOTE_LINE,
  isListingGamutOverlay,
  parseGamutListingIds,
} from "@/lib/listing-gamut";
import { listingGamutPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-gamut-it. Reads the cookie only. */
export async function ListingGamutNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseGamutListingIds(jar.get(GAMUT_COOKIE_NAME)?.value);

  if (!isListingGamutOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-gamut-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GAMUT_TABLE_LINE}
        title={GAMUT_NOTICE_TITLE}
        body={`${GAMUT_LOT_LINE} ${GAMUT_FLUOR_LINE} ${GAMUT_STILL_LINE} ${GAMUT_TOTE_LINE}`}
      >
        <Link
          href={listingGamutPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The gamut card
        </Link>
      </MallNotice>
    </div>
  );
}
