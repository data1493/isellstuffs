import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  ETALON_COOKIE_NAME,
  ETALON_LID_LINE,
  ETALON_NOTICE_TITLE,
  ETALON_POT_LINE,
  ETALON_STILL_LINE,
  ETALON_TABLE_LINE,
  ETALON_TOTE_LINE,
  isListingEtalonOverlay,
  parseEtalonListingIds,
} from "@/lib/listing-etalon";
import { listingEtalonPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-etalon-it. Reads the cookie only. */
export async function ListingEtalonNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseEtalonListingIds(jar.get(ETALON_COOKIE_NAME)?.value);

  if (!isListingEtalonOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-etalon-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={ETALON_TABLE_LINE}
        title={ETALON_NOTICE_TITLE}
        body={`${ETALON_LID_LINE} ${ETALON_POT_LINE} ${ETALON_STILL_LINE} ${ETALON_TOTE_LINE}`}
      >
        <Link
          href={listingEtalonPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The etalon card
        </Link>
      </MallNotice>
    </div>
  );
}
