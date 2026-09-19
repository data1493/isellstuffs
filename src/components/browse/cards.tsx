import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hubAtmosphere } from "@/lib/browse";
import { cn } from "@/lib/utils";
import {
  formatMoney,
  hubById,
  isDigitalListing,
  mallHubs,
  stallById,
  type Listing,
} from "@/lib/commerce";

const statusCopy = {
  available: "On the table",
  sold: "Sold",
  "file-gone": "File gone",
} as const;

export function ListingCard({ listing }: { listing: Listing }) {
  const stall = stallById(listing.stallId);
  const hub = hubById(listing.hubId);
  const gone = listing.status !== "available";
  const atmosphere = hubAtmosphere[listing.hubId];
  const spec = isDigitalListing(listing)
    ? listing.fileFormat
    : listing.condition;

  return (
    <Card
      className={cn(
        "h-full gap-0 py-0",
        gone ? "bg-muted/50" : "bg-card",
      )}
    >
      <div
        className={cn(
          "relative aspect-[5/3] overflow-hidden",
          atmosphere.wash,
          gone && "opacity-70",
        )}
      >
        <p className="absolute left-3 top-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-foreground/70">
          {isDigitalListing(listing) ? listing.fileFormat : atmosphere.floor}
        </p>
        {gone ? (
          <p className="absolute right-3 top-3 rounded-full bg-foreground px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-background">
            {statusCopy[listing.status]}
          </p>
        ) : null}
      </div>
      <CardHeader className="pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline">
            {listing.type === "physical" ? "Physical" : "Digital"}
          </Badge>
          <Badge variant={gone ? "secondary" : "default"}>
            {statusCopy[listing.status]}
          </Badge>
        </div>
        <CardTitle className="font-heading text-lg text-balance">
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
            {isDigitalListing(listing) ? "Format" : "Condition"}
          </p>
        </div>
        <p className="text-sm leading-5 text-foreground/80">{spec}</p>
        <p className="text-xs text-muted-foreground">
          {stall?.boothName ?? listing.stallId}
          {" · "}
          <Link
            href={hub.href}
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            {hub.name}
          </Link>
        </p>
      </CardContent>
    </Card>
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
        <div className={cn("px-5 py-4", atmosphere.wash)}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-foreground/60">
            {atmosphere.floor}
          </p>
          <h3 className="mt-1 font-heading text-2xl tracking-tight">{hub.name}</h3>
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
