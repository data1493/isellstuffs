import Link from "next/link";

import { ListingMediaPlaceholder } from "@/components/listing-media-placeholder";
import { ListingTypeBadge } from "@/components/listing-type-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hubAtmosphere } from "@/lib/browse";
import { listingPath } from "@/lib/paths";
import { cn } from "@/lib/utils";
import {
  formatMoney,
  hubById,
  mallHubs,
  stallById,
  type Listing,
} from "@/lib/commerce";
import {
  listingFact,
  listingFactLabel,
  listingStatusLabel,
} from "@/lib/listing-display";

export function ListingCard({ listing }: { listing: Listing }) {
  const stall = stallById(listing.stallId);
  const hub = hubById(listing.hubId);
  const gone = listing.status !== "available";

  return (
    <Link href={listingPath(listing.id)} className="group block h-full min-w-0">
      <Card
        className={cn(
          "h-full gap-0 py-0 transition-shadow group-hover:ring-foreground/20",
          gone ? "bg-muted/50" : "bg-card",
        )}
      >
        <ListingMediaPlaceholder
          listing={listing}
          compact
          className={cn(
            "rounded-none rounded-t-xl border-0 border-b border-dashed",
            gone && "opacity-70",
          )}
        />
        <CardHeader className="pt-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <ListingTypeBadge listing={listing} />
            <Badge variant={gone ? "secondary" : "ghost"}>
              {listingStatusLabel(listing)}
            </Badge>
          </div>
          <CardTitle className="font-heading text-lg text-balance underline-offset-4 group-hover:underline">
            {listing.title}
          </CardTitle>
          <CardDescription className="text-pretty">
            {listing.summary}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          <div className="flex items-baseline justify-between gap-3">
            <p
              className={
                gone
                  ? "text-muted-foreground line-through"
                  : "font-heading text-2xl tracking-tight"
              }
            >
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
            {stall?.boothName ?? listing.stallId}
            {" · "}
            {hub.name}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ListingGrid({ listings }: { listings: Listing[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <li key={listing.id} className="min-w-0">
          <ListingCard listing={listing} />
        </li>
      ))}
    </ul>
  );
}

export function HubTile({
  hub,
  count,
}: {
  hub: (typeof mallHubs)[number];
  count?: number;
}) {
  const atmosphere = hubAtmosphere[hub.id];

  return (
    <Link href={hub.href} className="group block h-full min-w-0">
      <Card className="h-full min-w-0 gap-0 overflow-hidden py-0 ring-1 ring-foreground/10 transition-colors group-hover:bg-secondary/30">
        <div className={cn("px-5 py-5", atmosphere.wash)}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-foreground/60">
            {atmosphere.floor}
          </p>
          <h3 className="mt-1 font-heading text-2xl tracking-tight">
            {hub.name}
          </h3>
        </div>
        <CardHeader className="pt-4">
          <CardDescription className="text-pretty text-sm leading-6 text-foreground/80">
            {hub.blurb}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pb-5">
          <p className="text-xs leading-5 text-muted-foreground">{hub.rule}</p>
          <p className="text-xs font-medium text-foreground">
            {atmosphere.refuse}
            {count !== undefined
              ? ` · ${count} ${count === 1 ? "thing" : "things"} on the table`
              : null}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
