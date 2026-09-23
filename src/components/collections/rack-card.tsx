import Link from "next/link";

import { ListingMediaPlaceholder } from "@/components/listing-media-placeholder";
import { ListingTypeBadge } from "@/components/listing-type-badge";
import { RackBadge } from "@/components/collections/rack-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney, stallById } from "@/lib/commerce";
import type { RackItem } from "@/lib/collections";
import {
  listingFact,
  listingFactLabel,
  listingHubName,
  listingStatusLabel,
} from "@/lib/listing-display";
import { listingPath, stallPath } from "@/lib/paths";

export function RackCard({ item }: { item: RackItem }) {
  const { listing, note } = item;
  const stall = stallById(listing.stallId);

  return (
    <article className="min-w-0">
      <Card className="h-full gap-0 bg-card py-0">
        <div className="relative">
          <ListingMediaPlaceholder
            listing={listing}
            compact
            className="rounded-none rounded-t-xl border-0 border-b border-dashed"
          />
          <RackBadge className="absolute top-3 left-3 bg-card/90 text-foreground" />
        </div>
        <CardHeader className="pt-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <ListingTypeBadge listing={listing} />
            <Badge variant="ghost">{listingStatusLabel(listing)}</Badge>
          </div>
          <CardTitle className="font-heading text-xl leading-snug text-balance">
            <Link
              href={listingPath(listing.id)}
              className="underline-offset-4 hover:underline"
            >
              {listing.title}
            </Link>
          </CardTitle>
          <CardDescription className="text-pretty">
            {listing.summary}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-5">
          <p className="border-l-2 border-primary/40 pl-3 text-sm leading-6 text-foreground/85">
            {note}
          </p>
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-heading text-2xl tracking-tight">
              {formatMoney(listing.price)}
            </p>
            <p className="text-right text-xs leading-5 text-muted-foreground">
              {listingFactLabel(listing)}
            </p>
          </div>
          <p className="text-sm leading-5 text-foreground/80">
            {listingFact(listing)}
          </p>
          <p className="text-xs text-muted-foreground">
            {stall ? (
              <Link
                href={stallPath(stall.slug)}
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                {stall.boothName}
              </Link>
            ) : (
              listing.stallId
            )}
            {" · "}
            {listingHubName(listing)}
          </p>
        </CardContent>
      </Card>
    </article>
  );
}
