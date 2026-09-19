import type { Metadata } from "next";
import { cookies } from "next/headers";

import { WatchedEmpty } from "@/app/watched/watched-empty";
import { WatchedTables } from "@/app/watched/watched-tables";
import { watchedMetadata } from "@/lib/seo";
import {
  parseWatchedStallIds,
  WATCHED_COOKIE_NAME,
  WATCHED_STORAGE_KEY,
} from "@/lib/watched-stalls";

export const dynamic = "force-dynamic";

export const metadata: Metadata = watchedMetadata();

const syncScript = `try{var m=document.cookie.match(/(?:^|; )${WATCHED_COOKIE_NAME}=([^;]*)/);if(m){localStorage.setItem(${JSON.stringify(WATCHED_STORAGE_KEY)},decodeURIComponent(m[1]));}}catch(e){}`;

function parsePackedNotice(value: string | string[] | undefined): boolean {
  const notice = Array.isArray(value) ? value[0] : value;
  return notice === "packed";
}

export default async function WatchedPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const params = await searchParams;
  const packed = parsePackedNotice(params.notice);
  const jar = await cookies();
  const stallIds = parseWatchedStallIds(jar.get(WATCHED_COOKIE_NAME)?.value);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: syncScript }} />
      {stallIds.length === 0 ? (
        <WatchedEmpty packed={packed} />
      ) : (
        <WatchedTables stallIds={stallIds} packed={packed} />
      )}
    </>
  );
}
