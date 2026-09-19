import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  TRAY_CASE_LINE,
  TRAY_COOKIE_NAME,
  TRAY_NOTICE_TITLE,
  TRAY_STILL_LINE,
  TRAY_TABLE_LINE,
  TRAY_TOTE_LINE,
  isListingTrayOverlay,
  parseTrayListingIds,
} from "@/lib/listing-tray";
import { listingTrayPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-tray-it. Does not change the tote. */
export async function ListingTrayNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseTrayListingIds(jar.get(TRAY_COOKIE_NAME)?.value);

  if (!isListingTrayOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-tray-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={TRAY_TABLE_LINE}
        title={TRAY_NOTICE_TITLE}
        body={`${TRAY_CASE_LINE} ${TRAY_STILL_LINE} ${TRAY_TOTE_LINE}`}
      >
        <Link
          href={listingTrayPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The tray card
        </Link>
      </MallNotice>
    </div>
  );
}
