import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  ZIP_COOKIE_NAME,
  ZIP_FOLDER_LINE,
  ZIP_INK_LINE,
  ZIP_NOTICE_TITLE,
  ZIP_STICK_LINE,
  ZIP_STILL_LINE,
  ZIP_TABLE_LINE,
  ZIP_TOTE_LINE,
  isListingZipOverlay,
  parseZipListingIds,
} from "@/lib/listing-zip";
import { listingZipPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-don't-have-the-zip. Does not change the tote. */
export async function ListingZipNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseZipListingIds(jar.get(ZIP_COOKIE_NAME)?.value);

  if (!isListingZipOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-zip-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={ZIP_TABLE_LINE}
        title={ZIP_NOTICE_TITLE}
        body={`${ZIP_STICK_LINE} ${ZIP_INK_LINE} ${ZIP_FOLDER_LINE} ${ZIP_STILL_LINE} ${ZIP_TOTE_LINE}`}
      >
        <Link
          href={listingZipPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The zip card
        </Link>
      </MallNotice>
    </div>
  );
}
