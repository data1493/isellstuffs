import type { Metadata } from "next";
import { cookies } from "next/headers";

import { WalkEmpty } from "@/app/walk/walk-empty";
import { WalkStops } from "@/app/walk/walk-stops";
import { PACKED_COOKIE_NAME, PACKED_MIRROR_SCRIPT } from "@/lib/packed-stall";
import { walkMetadata } from "@/lib/seo";
import { saturdayWalkSheet } from "@/lib/walk-sheet";
import {
  WATCHED_COOKIE_NAME,
  WATCHED_STORAGE_KEY,
} from "@/lib/watched-stalls";
import {
  WEEKEND_HOURS_COOKIE,
  WEEKEND_HOURS_MIRROR_SCRIPT,
} from "@/lib/weekend-hours";

export const dynamic = "force-dynamic";

export const metadata: Metadata = walkMetadata();

const watchedSync = `try{var m=document.cookie.match(/(?:^|; )${WATCHED_COOKIE_NAME}=([^;]*)/);if(m){localStorage.setItem(${JSON.stringify(WATCHED_STORAGE_KEY)},decodeURIComponent(m[1]));}}catch(e){}`;

export default async function WalkPage() {
  const jar = await cookies();
  const sheet = saturdayWalkSheet({
    watchedRaw: jar.get(WATCHED_COOKIE_NAME)?.value,
    packedRaw: jar.get(PACKED_COOKIE_NAME)?.value,
    hoursRaw: jar.get(WEEKEND_HOURS_COOKIE)?.value,
  });

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: watchedSync }} />
      <script dangerouslySetInnerHTML={{ __html: PACKED_MIRROR_SCRIPT }} />
      <script
        dangerouslySetInnerHTML={{ __html: WEEKEND_HOURS_MIRROR_SCRIPT }}
      />
      {sheet.stops.length === 0 ? (
        <WalkEmpty packedAway={sheet.packedAwayCount > 0} />
      ) : (
        <WalkStops
          stops={sheet.stops}
          packedAwayCount={sheet.packedAwayCount}
        />
      )}
    </>
  );
}
