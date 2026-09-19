import { cookies } from "next/headers";

import { buttonVariants } from "@/components/ui/button";
import { CART_COOKIE_NAME, CART_MIRROR_SCRIPT, parseCartListingIds } from "@/lib/cart";
import { isCartEligible, listingById } from "@/lib/commerce";
import {
  addToCartLabel,
  alreadyInCartCopy,
  inCartLabel,
  unavailableCartLabel,
} from "@/lib/listing-display";
import { listingPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export async function AddToCartButton({
  listingId,
  returnTo,
  size = "lg",
  compact = false,
  className,
}: {
  listingId: string;
  returnTo?: string;
  size?: "lg" | "default" | "sm";
  compact?: boolean;
  className?: string;
}) {
  const listing = listingById(listingId);

  if (!listing) {
    return null;
  }

  const jar = await cookies();
  const listingIds = parseCartListingIds(jar.get(CART_COOKIE_NAME)?.value);
  const inCart = listingIds.includes(listingId);
  const eligible = isCartEligible(listing);
  const buttonClass = cn(
    buttonVariants({
      variant: eligible ? "default" : "secondary",
      size,
    }),
    "w-full rounded-full px-5 sm:w-auto",
    className,
  );

  if (!eligible) {
    return (
      <button type="button" disabled className={buttonClass}>
        {unavailableCartLabel(listing)}
      </button>
    );
  }

  return (
    <form
      action="/listings/bag"
      method="post"
      className={cn("space-y-2", compact && "min-w-0 flex-1")}
    >
      <script dangerouslySetInnerHTML={{ __html: CART_MIRROR_SCRIPT }} />
      <input type="hidden" name="listingId" value={listing.id} />
      <input
        type="hidden"
        name="returnTo"
        value={returnTo ?? listingPath(listing.id)}
      />
      <button
        type="submit"
        disabled={inCart}
        data-in-cart={inCart ? "true" : "false"}
        aria-label={inCart ? inCartLabel(listing) : addToCartLabel(listing)}
        className={buttonClass}
      >
        {inCart ? inCartLabel(listing) : addToCartLabel(listing)}
      </button>
      {inCart ? (
        <p
          aria-live="polite"
          className={cn(
            "text-muted-foreground",
            compact ? "text-xs leading-5" : "text-sm leading-6",
          )}
        >
          {alreadyInCartCopy(listing)}
        </p>
      ) : null}
    </form>
  );
}
