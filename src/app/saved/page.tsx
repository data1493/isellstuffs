import type { Metadata } from "next";
import { cookies } from "next/headers";

import { SavedEmpty } from "@/app/saved/saved-empty";
import { SavedPile } from "@/app/saved/saved-pile";
import { parseSavedListingIds, SAVED_COOKIE_NAME, SAVED_STORAGE_KEY } from "@/lib/saved";
import type { SavedBagNotice } from "@/lib/saved-bag";
import { savedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = savedMetadata();

const syncScript = `try{var m=document.cookie.match(/(?:^|; )${SAVED_COOKIE_NAME}=([^;]*)/);if(m){localStorage.setItem(${JSON.stringify(SAVED_STORAGE_KEY)},decodeURIComponent(m[1]));}}catch(e){}`;

function parseBagNotice(value: string | string[] | undefined): SavedBagNotice | undefined {
  const bag = Array.isArray(value) ? value[0] : value;
  if (bag === "scooped" || bag === "empty") {
    return bag;
  }
  return undefined;
}

export default async function SavedPage({
  searchParams,
}: {
  searchParams: Promise<{ bag?: string | string[] }>;
}) {
  const params = await searchParams;
  const bag = parseBagNotice(params.bag);
  const jar = await cookies();
  const listingIds = parseSavedListingIds(jar.get(SAVED_COOKIE_NAME)?.value);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: syncScript }} />
      {listingIds.length === 0 ? (
        <SavedEmpty bag={bag} />
      ) : (
        <SavedPile listingIds={listingIds} bag={bag} />
      )}
    </>
  );
}
