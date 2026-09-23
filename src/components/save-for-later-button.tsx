import Link from "next/link";
import { cookies } from "next/headers";

import { buttonVariants } from "@/components/ui/button";
import { isCartEligible, listingById } from "@/lib/commerce";
import { listingPath, savedPath } from "@/lib/paths";
import {
  parseSavedListingIds,
  SAVED_COOKIE_NAME,
  SAVED_STORAGE_KEY,
} from "@/lib/saved";
import { cn } from "@/lib/utils";

const syncScript = `try{var m=document.cookie.match(/(?:^|; )${SAVED_COOKIE_NAME}=([^;]*)/);if(m){localStorage.setItem(${JSON.stringify(SAVED_STORAGE_KEY)},decodeURIComponent(m[1]));}}catch(e){}`;

export async function SaveForLaterButton({
  listingId,
  returnTo,
  size = "lg",
  className,
}: {
  listingId: string;
  returnTo?: string;
  size?: "lg" | "default" | "sm";
  className?: string;
}) {
  const listing = listingById(listingId);

  if (!listing || !isCartEligible(listing)) {
    return null;
  }

  const jar = await cookies();
  const listingIds = parseSavedListingIds(jar.get(SAVED_COOKIE_NAME)?.value);
  const saved = listingIds.includes(listingId);
  const buttonClass = cn(
    buttonVariants({
      variant: "outline",
      size,
    }),
    "w-full rounded-full px-5 sm:w-auto",
    className,
  );

  if (saved) {
    return (
      <div className="space-y-2">
        <script dangerouslySetInnerHTML={{ __html: syncScript }} />
        <Link href={savedPath()} className={buttonClass}>
          In the later pile
        </Link>
        <p className="text-sm leading-6 text-muted-foreground">Parked, not paid.</p>
      </div>
    );
  }

  return (
    <form action="/listings/later" method="post" className="space-y-2">
      <script dangerouslySetInnerHTML={{ __html: syncScript }} />
      <input type="hidden" name="listingId" value={listing.id} />
      <input
        type="hidden"
        name="returnTo"
        value={returnTo ?? listingPath(listing.id)}
      />
      <button type="submit" className={buttonClass}>
        Save for later
      </button>
    </form>
  );
}
