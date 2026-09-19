import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  ICONS_COOKIE_NAME,
  ICONS_NOTICE_TITLE,
  ICONS_STILL_LINE,
  ICONS_TABLE_LINE,
  ICONS_TOTE_LINE,
  ICONS_WALK_LINE,
  ICONS_WEIGHTS_LINE,
  isListingIconsOverlay,
  parseIconsListingIds,
} from "@/lib/listing-icons";
import { listingIconsPath } from "@/lib/paths";

/** PDP banner when this file stays two weights. Does not change the tote. */
export async function ListingIconsNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseIconsListingIds(jar.get(ICONS_COOKIE_NAME)?.value);

  if (!isListingIconsOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-icons-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={ICONS_TABLE_LINE}
        title={ICONS_NOTICE_TITLE}
        body={`${ICONS_WEIGHTS_LINE} ${ICONS_WALK_LINE} ${ICONS_STILL_LINE} ${ICONS_TOTE_LINE}`}
      >
        <Link
          href={listingIconsPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The icons card
        </Link>
      </MallNotice>
    </div>
  );
}
