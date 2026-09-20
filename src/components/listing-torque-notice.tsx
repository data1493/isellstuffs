import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  TORQUE_COOKIE_NAME,
  TORQUE_HISS_LINE,
  TORQUE_NOTICE_TITLE,
  TORQUE_RADIO_LINE,
  TORQUE_STILL_LINE,
  TORQUE_TABLE_LINE,
  TORQUE_TOTE_LINE,
  isListingTorqueOverlay,
  parseTorqueListingIds,
} from "@/lib/listing-torque";
import { listingTorquePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-torque-it. Reads the cookie only. */
export async function ListingTorqueNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseTorqueListingIds(jar.get(TORQUE_COOKIE_NAME)?.value);

  if (!isListingTorqueOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-torque-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={TORQUE_TABLE_LINE}
        title={TORQUE_NOTICE_TITLE}
        body={`${TORQUE_HISS_LINE} ${TORQUE_RADIO_LINE} ${TORQUE_STILL_LINE} ${TORQUE_TOTE_LINE}`}
      >
        <Link
          href={listingTorquePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The torque card
        </Link>
      </MallNotice>
    </div>
  );
}
