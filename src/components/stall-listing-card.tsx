import Link from "next/link";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { ListingMediaPlaceholder } from "@/components/listing-media-placeholder";
import { ListingTypeBadge } from "@/components/listing-type-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatMoney,
  isPhysicalListing,
  stallById,
  type Listing,
} from "@/lib/commerce";
import {
  listingFact,
  listingFactLabel,
  listingHubName,
  listingStatusLabel,
} from "@/lib/listing-display";
import { listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function StallListingCard({ listing }: { listing: Listing }) {
  const physical = isPhysicalListing(listing);

  return (
    <Card
      className={cn(
        "h-full bg-card py-0",
        physical
          ? "ring-primary/12"
          : "ring-accent-foreground/12",
      )}
    >
      <ListingMediaPlaceholder
        listing={listing}
        compact
        className="rounded-none rounded-t-xl border-0 border-b border-dashed"
      />
      <CardHeader className="pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <ListingTypeBadge listing={listing} />
          <Badge
            variant={listing.status === "available" ? "ghost" : "destructive"}
          >
            {listingStatusLabel(listing)}
          </Badge>
        </div>
        <CardTitle className="font-heading text-xl leading-snug">
          <Link
            href={listingPath(listing.id)}
            className="underline-offset-4 hover:underline"
          >
            {listing.title}
          </Link>
        </CardTitle>
        <CardDescription className="text-sm leading-6">
          {listing.summary}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="font-heading text-2xl tracking-tight">
          {formatMoney(listing.price)}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {listingFactLabel(listing)}:
          </span>{" "}
          {listingFact(listing)}
        </p>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          {listingHubName(listing)}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <AddToCartButton
          listingId={listing.id}
          returnTo={stallPath(stallById(listing.stallId)?.slug ?? listing.stallId)}
          size="default"
          compact
        />
        <Link
          href={listingPath(listing.id)}
          className="pt-1 text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:shrink-0"
        >
          Open listing
        </Link>
      </CardFooter>
    </Card>
  );
}
