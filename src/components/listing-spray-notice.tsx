import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SPRAY_COOKIE_NAME,
  SPRAY_JACKET_LINE,
  SPRAY_NOTICE_TITLE,
  SPRAY_STILL_LINE,
  SPRAY_TABLE_LINE,
  SPRAY_TOTE_LINE,
  isListingSprayOverlay,
  parseSprayListingIds,
} from "@/lib/listing-spray";
import { listingSprayPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-spray-it. Does not change the tote. */
export async function ListingSprayNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseSprayListingIds(jar.get(SPRAY_COOKIE_NAME)?.value);

  if (!isListingSprayOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-spray-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SPRAY_TABLE_LINE}
        title={SPRAY_NOTICE_TITLE}
        body={`${SPRAY_JACKET_LINE} ${SPRAY_STILL_LINE} ${SPRAY_TOTE_LINE}`}
      >
        <Link
          href={listingSprayPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The spray card
        </Link>
      </MallNotice>
    </div>
  );
}
