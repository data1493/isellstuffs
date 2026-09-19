import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CASES_COOKIE_NAME,
  CASES_JEWEL_LINE,
  CASES_PLAYS_LINE,
  CASES_STILL_LINE,
  CASES_TABLE_LINE,
  CASES_TOTE_LINE,
  CASES_WRAP_LINE,
  isListingCasesOverlay,
  parseCasesListingIds,
} from "@/lib/listing-cases";
import { listingCasesPath } from "@/lib/paths";

/** PDP banner when this SKU is an empty jewel case. Does not change the tote. */
export async function ListingCasesNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseCasesListingIds(jar.get(CASES_COOKIE_NAME)?.value);

  if (!isListingCasesOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-cases-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The discs walked"
        title={CASES_TABLE_LINE}
        body={`${CASES_JEWEL_LINE} ${CASES_PLAYS_LINE} ${CASES_WRAP_LINE} ${CASES_STILL_LINE} ${CASES_TOTE_LINE}`}
      >
        <Link
          href={listingCasesPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The empty-case card
        </Link>
      </MallNotice>
    </div>
  );
}
