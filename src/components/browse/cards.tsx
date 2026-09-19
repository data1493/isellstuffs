import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatMoney,
  hubById,
  isDigitalListing,
  mallHubs,
  stallById,
  type AdSlot,
  type Listing,
} from "@/lib/commerce";

const statusCopy = {
  available: "On the table",
  sold: "Sold",
  "file-gone": "File gone",
} as const;

const adKindCopy = {
  "featured-stall": "Featured stall",
  "homepage-takeover": "Homepage takeover",
  "hub-takeover": "Hub takeover",
} as const;

export function ListingCard({ listing }: { listing: Listing }) {
  const stall = stallById(listing.stallId);
  const hub = hubById(listing.hubId);
  const gone = listing.status !== "available";

  return (
    <Card className={gone ? "bg-muted/40" : "bg-card"}>
      <CardHeader>
        <div className="flex flex-wrap gap-1.5">
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
      <CardContent className="space-y-2">
        <p
          className={
            gone
              ? "text-muted-foreground line-through"
              : "font-heading text-xl tracking-tight"
          }
        >
          {formatMoney(listing.price)}
        </p>
        <p className="text-sm text-muted-foreground">
          {isDigitalListing(listing) ? listing.fileFormat : listing.condition}
        </p>
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
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <li key={listing.id}>
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
  return (
    <Link href={hub.href} className="block h-full">
      <Card className="h-full bg-card transition-colors hover:bg-secondary/40">
        <CardHeader>
          <CardTitle className="font-heading text-lg">{hub.name}</CardTitle>
          <CardDescription className="text-pretty">{hub.blurb}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs leading-5 text-muted-foreground">{hub.rule}</p>
          {count !== undefined ? (
            <p className="text-xs font-medium text-foreground">
              {count} {count === 1 ? "thing" : "things"} on the table
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}

export function AdCallout({ slot }: { slot: AdSlot }) {
  const stall = stallById(slot.stallId);
  const hub = slot.hubId ? hubById(slot.hubId) : undefined;

  return (
    <Card className="bg-secondary/50 ring-1 ring-primary/15">
      <CardHeader>
        <div className="flex flex-wrap gap-1.5">
          <Badge>Paid placement</Badge>
          <Badge variant="outline">{adKindCopy[slot.kind]}</Badge>
        </div>
        <CardTitle className="font-heading text-xl text-balance sm:text-2xl">
          {slot.headline}
        </CardTitle>
        <CardDescription className="text-pretty text-base">
          {slot.blurb}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {stall?.boothName ?? slot.stallId}
        {hub ? (
          <>
            {" · "}
            <Link
              href={hub.href}
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              {hub.name}
            </Link>
          </>
        ) : null}
        {" · "}
        {slot.window}
      </CardContent>
    </Card>
  );
}
