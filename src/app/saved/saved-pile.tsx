import Link from "next/link";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { ListingTypeBadge } from "@/components/listing-type-badge";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallHero, MallWidth } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  formatMoney,
  isCartEligible,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import { listingPath, savedBagPath, savedPath, stallPath } from "@/lib/paths";
import type { SavedBagNotice } from "@/lib/saved-bag";
import { cn } from "@/lib/utils";

function DropFromPileButton({ listingId }: { listingId: string }) {
  return (
    <form action="/listings/later" method="post" className="w-full sm:w-auto">
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value="remove" />
      <input type="hidden" name="returnTo" value={savedPath()} />
      <button
        type="submit"
        className={cn(
          buttonVariants({ variant: "ghost", size: "lg" }),
          "w-full rounded-full px-5 sm:w-auto",
        )}
      >
        Drop from the pile
      </button>
    </form>
  );
}

function BagThePileButton() {
  return (
    <form action={savedBagPath()} method="post" className="w-full max-w-xl">
      <button
        type="submit"
        className={cn(
          buttonVariants({ variant: "default", size: "lg" }),
          "w-full rounded-full px-5",
        )}
      >
        Bag the pile
      </button>
    </form>
  );
}

function PileBagNotice({ bag }: { bag: SavedBagNotice }) {
  if (bag === "scooped") {
    return (
      <MallNotice
        padded={false}
        tone="empty"
        titleAs="h2"
        eyebrow="Scooped"
        title="Scooped into the tote. The pile is still a pile."
        body="Eligible finds are in the bag. Sold and file-gone stayed parked. Saving still does not bag."
        actions={
          <Button
            className="rounded-full px-5"
            render={<Link href="/cart" />}
          >
            Open the tote
          </Button>
        }
      />
    );
  }

  return (
    <MallNotice
      padded={false}
      tone="empty"
      titleAs="h2"
      eyebrow="Later pile"
      title="Nothing still here to bag."
      body="Sold, pulled, and missing SKUs stay in the pile. The tote did not change."
    />
  );
}

export function SavedPile({
  listingIds,
  bag,
}: {
  listingIds: string[];
  bag?: SavedBagNotice;
}) {
  const rows = listingIds.map((id) => {
    const listing = listingById(id);
    const stall = listing ? stallById(listing.stallId) : undefined;
    return { id, listing, stall };
  });

  return (
    <div>
      <MallHero>
        <MallCrumb label="Later pile">
          <CrumbSep />
          <span className="text-foreground">Later pile</span>
        </MallCrumb>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full">
            Parked, not paid.
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {`${rows.length} ${rows.length === 1 ? "find" : "finds"}`}
          </Badge>
        </div>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Later pile
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Things you parked while walking the aisles. Saving does not put them
            in the tote. Adding to the tote does not drop them from here.
          </p>
        </div>
        <BagThePileButton />
        {bag ? <PileBagNotice bag={bag} /> : null}
      </MallHero>

      <MallWidth className="flex flex-col gap-8 py-12 sm:py-16">
        <ul className="space-y-4">
          {rows.map(({ id, listing, stall }) => {
            if (!listing) {
              return (
                <li
                  key={id}
                  className="rounded-2xl bg-muted/50 p-5 ring-1 ring-foreground/10"
                >
                  <p className="font-heading text-lg tracking-tight">{id}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    That SKU is no longer on a table.
                  </p>
                  <div className="mt-4">
                    <DropFromPileButton listingId={id} />
                  </div>
                </li>
              );
            }

            return (
              <li
                key={id}
                className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <ListingTypeBadge listing={listing} />
                  <Badge variant="outline">{listingHubName(listing)}</Badge>
                  {isCartEligible(listing) ? null : (
                    <Badge variant="destructive">Gone</Badge>
                  )}
                </div>
                <h2 className="mt-3 font-heading text-2xl leading-snug tracking-tight">
                  <Link
                    href={listingPath(listing.id)}
                    className="underline-offset-4 hover:underline"
                  >
                    {listing.title}
                  </Link>
                </h2>
                <p className="mt-1 font-heading text-xl">
                  {formatMoney(listing.price)}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {stall ? (
                    <Link
                      href={stallPath(stall.slug)}
                      className="underline-offset-4 hover:underline"
                    >
                      {stall.boothName}
                    </Link>
                  ) : (
                    listing.stallId
                  )}
                </p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start">
                  <AddToCartButton
                    listingId={listing.id}
                    returnTo={savedPath()}
                    compact
                  />
                  <DropFromPileButton listingId={listing.id} />
                </div>
              </li>
            );
          })}
        </ul>
      </MallWidth>
    </div>
  );
}
