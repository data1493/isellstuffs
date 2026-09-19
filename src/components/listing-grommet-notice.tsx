import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GROMMET_BOX_LINE,
  GROMMET_COOKIE_NAME,
  GROMMET_NECK_LINE,
  GROMMET_NOTICE_TITLE,
  GROMMET_STILL_LINE,
  GROMMET_TABLE_LINE,
  GROMMET_TOTE_LINE,
  isListingGrommetOverlay,
  parseGrommetListingIds,
} from "@/lib/listing-grommet";
import { listingGrommetPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-grommet-it. Reads the cookie only. */
export async function ListingGrommetNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseGrommetListingIds(jar.get(GROMMET_COOKIE_NAME)?.value);

  if (!isListingGrommetOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-grommet-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GROMMET_TABLE_LINE}
        title={GROMMET_NOTICE_TITLE}
        body={`${GROMMET_BOX_LINE} ${GROMMET_NECK_LINE} ${GROMMET_STILL_LINE} ${GROMMET_TOTE_LINE}`}
      >
        <Link
          href={listingGrommetPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The grommet card
        </Link>
      </MallNotice>
    </div>
  );
}
