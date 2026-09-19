import type { Metadata } from "next";
import { cookies } from "next/headers";

import { SavedEmpty } from "@/app/saved/saved-empty";
import { SavedPile } from "@/app/saved/saved-pile";
import { parseSavedListingIds, SAVED_COOKIE_NAME, SAVED_STORAGE_KEY } from "@/lib/saved";
import { savedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = savedMetadata();

const syncScript = `try{var m=document.cookie.match(/(?:^|; )${SAVED_COOKIE_NAME}=([^;]*)/);if(m){localStorage.setItem(${JSON.stringify(SAVED_STORAGE_KEY)},decodeURIComponent(m[1]));}}catch(e){}`;

export default async function SavedPage() {
  const jar = await cookies();
  const listingIds = parseSavedListingIds(jar.get(SAVED_COOKIE_NAME)?.value);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: syncScript }} />
      {listingIds.length === 0 ? (
        <SavedEmpty />
      ) : (
        <SavedPile listingIds={listingIds} />
      )}
    </>
  );
}
