import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SOCKET_COOKIE_NAME,
  SOCKET_LIGHTS_LINE,
  SOCKET_NECK_LINE,
  SOCKET_NOTICE_TITLE,
  SOCKET_STILL_LINE,
  SOCKET_TABLE_LINE,
  SOCKET_TOTE_LINE,
  isListingSocketOverlay,
  parseSocketListingIds,
} from "@/lib/listing-socket";
import { listingSocketPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-socket-it. Reads the cookie only. */
export async function ListingSocketNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseSocketListingIds(jar.get(SOCKET_COOKIE_NAME)?.value);

  if (!isListingSocketOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-socket-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SOCKET_TABLE_LINE}
        title={SOCKET_NOTICE_TITLE}
        body={`${SOCKET_NECK_LINE} ${SOCKET_LIGHTS_LINE} ${SOCKET_STILL_LINE} ${SOCKET_TOTE_LINE}`}
      >
        <Link
          href={listingSocketPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The socket card
        </Link>
      </MallNotice>
    </div>
  );
}
