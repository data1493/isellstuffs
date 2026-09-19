import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PROFILE_COOKIE_NAME,
  PROFILE_LOOKS_LINE,
  PROFILE_NOTICE_TITLE,
  PROFILE_PARK_LINE,
  PROFILE_STILL_LINE,
  PROFILE_TABLE_LINE,
  PROFILE_TOTE_LINE,
  isListingProfileOverlay,
  parseProfileListingIds,
} from "@/lib/listing-profile";
import { listingProfilePath } from "@/lib/paths";

/** PDP banner when this file stays three parking-lot looks. Does not change the tote. */
export async function ListingProfileNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseProfileListingIds(jar.get(PROFILE_COOKIE_NAME)?.value);

  if (!isListingProfileOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-profile-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PROFILE_TABLE_LINE}
        title={PROFILE_NOTICE_TITLE}
        body={`${PROFILE_LOOKS_LINE} ${PROFILE_PARK_LINE} ${PROFILE_STILL_LINE} ${PROFILE_TOTE_LINE}`}
      >
        <Link
          href={listingProfilePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The profile card
        </Link>
      </MallNotice>
    </div>
  );
}
