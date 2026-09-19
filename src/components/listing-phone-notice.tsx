import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PHONE_BRICK_LINE,
  PHONE_COOKIE_NAME,
  PHONE_HONEST_LINE,
  PHONE_NOTICE_TITLE,
  PHONE_PARTS_LINE,
  PHONE_STILL_LINE,
  PHONE_TABLE_LINE,
  PHONE_TOTE_LINE,
  isListingPhoneOverlay,
  parsePhoneListingIds,
} from "@/lib/listing-phone";
import { listingPhonePath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-don't-know-the-phone. Does not change the tote. */
export async function ListingPhoneNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parsePhoneListingIds(jar.get(PHONE_COOKIE_NAME)?.value);

  if (!isListingPhoneOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-phone-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PHONE_TABLE_LINE}
        title={PHONE_NOTICE_TITLE}
        body={`${PHONE_HONEST_LINE} ${PHONE_PARTS_LINE} ${PHONE_BRICK_LINE} ${PHONE_STILL_LINE} ${PHONE_TOTE_LINE}`}
      >
        <Link
          href={listingPhonePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The phone card
        </Link>
      </MallNotice>
    </div>
  );
}
