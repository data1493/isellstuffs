import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  FERRITE_COOKIE_NAME,
  FERRITE_NOTICE_TITLE,
  FERRITE_PILE_LINE,
  FERRITE_STILL_LINE,
  FERRITE_TABLE_LINE,
  FERRITE_TOTE_LINE,
  FERRITE_UNTESTED_LINE,
  isListingFerriteOverlay,
  parseFerriteListingIds,
} from "@/lib/listing-ferrite";
import { listingFerritePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-ferrite-them. Reads the cookie only. */
export async function ListingFerriteNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseFerriteListingIds(jar.get(FERRITE_COOKIE_NAME)?.value);

  if (!isListingFerriteOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-ferrite-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={FERRITE_TABLE_LINE}
        title={FERRITE_NOTICE_TITLE}
        body={`${FERRITE_PILE_LINE} ${FERRITE_UNTESTED_LINE} ${FERRITE_STILL_LINE} ${FERRITE_TOTE_LINE}`}
      >
        <Link
          href={listingFerritePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The ferrite card
        </Link>
      </MallNotice>
    </div>
  );
}
