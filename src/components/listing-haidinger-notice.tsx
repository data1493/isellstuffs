import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  HAIDINGER_COOKIE_NAME,
  HAIDINGER_LID_LINE,
  HAIDINGER_NOTICE_TITLE,
  HAIDINGER_POT_LINE,
  HAIDINGER_STILL_LINE,
  HAIDINGER_TABLE_LINE,
  HAIDINGER_TOTE_LINE,
  isListingHaidingerOverlay,
  parseHaidingerListingIds,
} from "@/lib/listing-haidinger";
import { listingHaidingerPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-haidinger-it. Reads the cookie only. */
export async function ListingHaidingerNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseHaidingerListingIds(jar.get(HAIDINGER_COOKIE_NAME)?.value);

  if (!isListingHaidingerOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-haidinger-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={HAIDINGER_TABLE_LINE}
        title={HAIDINGER_NOTICE_TITLE}
        body={`${HAIDINGER_LID_LINE} ${HAIDINGER_POT_LINE} ${HAIDINGER_STILL_LINE} ${HAIDINGER_TOTE_LINE}`}
      >
        <Link
          href={listingHaidingerPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The haidinger card
        </Link>
      </MallNotice>
    </div>
  );
}
