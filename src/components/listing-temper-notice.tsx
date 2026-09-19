import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  TEMPER_COOKIE_NAME,
  TEMPER_METAL_LINE,
  TEMPER_NOTICE_TITLE,
  TEMPER_SPLAYED_LINE,
  TEMPER_STILL_LINE,
  TEMPER_TABLE_LINE,
  TEMPER_TOTE_LINE,
  isListingTemperOverlay,
  parseTemperListingIds,
} from "@/lib/listing-temper";
import { listingTemperPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-temper-it. Reads the cookie only. */
export async function ListingTemperNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseTemperListingIds(jar.get(TEMPER_COOKIE_NAME)?.value);

  if (!isListingTemperOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-temper-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={TEMPER_TABLE_LINE}
        title={TEMPER_NOTICE_TITLE}
        body={`${TEMPER_SPLAYED_LINE} ${TEMPER_METAL_LINE} ${TEMPER_STILL_LINE} ${TEMPER_TOTE_LINE}`}
      >
        <Link
          href={listingTemperPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The temper card
        </Link>
      </MallNotice>
    </div>
  );
}
