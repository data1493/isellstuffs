import { AddToCartButton } from "@/components/add-to-cart-button";
import { SaveForLaterButton } from "@/components/save-for-later-button";
import { formatMoney, isPhysicalListing, type Listing } from "@/lib/commerce";
import { listingPath } from "@/lib/paths";
import {
  fulfillmentCopy,
  listingBuyKicker,
  listingFact,
  listingFactLabel,
} from "@/lib/listing-display";
import { cn } from "@/lib/utils";

export function ListingBuyBox({ listing }: { listing: Listing }) {
  const physical = isPhysicalListing(listing);

  return (
    <div
      className={cn(
        "rounded-2xl p-5 ring-1 sm:p-6",
        physical
          ? "bg-card ring-primary/15"
          : "bg-card ring-accent-foreground/15",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {listingBuyKicker(listing)}
      </p>
      <p className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        {formatMoney(listing.price)}
      </p>
      <p className="mt-2 text-sm leading-6 text-foreground">
        <span className="font-medium">{listingFactLabel(listing)}:</span>{" "}
        {listingFact(listing)}
      </p>
      <div className="mt-5 space-y-2">
        <AddToCartButton
          listingId={listing.id}
          returnTo={listingPath(listing.id)}
        />
        <SaveForLaterButton
          listingId={listing.id}
          returnTo={listingPath(listing.id)}
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {fulfillmentCopy(listing)}
      </p>
    </div>
  );
}
