import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CONSULT_COOKIE_NAME,
  CONSULT_NOTICE_TITLE,
  CONSULT_ONE_LINE,
  CONSULT_RULE_LINE,
  CONSULT_STILL_LINE,
  CONSULT_TABLE_LINE,
  CONSULT_TOTE_LINE,
  isListingConsultOverlay,
  parseConsultListingIds,
} from "@/lib/listing-consult";
import { listingConsultPath } from "@/lib/paths";

/** PDP banner when this file stays a rule of thumb. Does not change the tote. */
export async function ListingConsultNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseConsultListingIds(jar.get(CONSULT_COOKIE_NAME)?.value);

  if (!isListingConsultOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-consult-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={CONSULT_TABLE_LINE}
        title={CONSULT_NOTICE_TITLE}
        body={`${CONSULT_ONE_LINE} ${CONSULT_RULE_LINE} ${CONSULT_STILL_LINE} ${CONSULT_TOTE_LINE}`}
      >
        <Link
          href={listingConsultPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The consult card
        </Link>
      </MallNotice>
    </div>
  );
}
