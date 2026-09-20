import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  STRAIN_CHARGER_LINE,
  STRAIN_COOKIE_NAME,
  STRAIN_NOTICE_TITLE,
  STRAIN_STILL_LINE,
  STRAIN_TABLE_LINE,
  STRAIN_TOTE_LINE,
  STRAIN_USB_LINE,
  isListingStrainOverlay,
  parseStrainListingIds,
} from "@/lib/listing-strain";
import { listingStrainPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-strain-them. Reads the cookie only. */
export async function ListingStrainNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseStrainListingIds(jar.get(STRAIN_COOKIE_NAME)?.value);

  if (!isListingStrainOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-strain-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={STRAIN_TABLE_LINE}
        title={STRAIN_NOTICE_TITLE}
        body={`${STRAIN_USB_LINE} ${STRAIN_CHARGER_LINE} ${STRAIN_STILL_LINE} ${STRAIN_TOTE_LINE}`}
      >
        <Link
          href={listingStrainPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The strain card
        </Link>
      </MallNotice>
    </div>
  );
}
