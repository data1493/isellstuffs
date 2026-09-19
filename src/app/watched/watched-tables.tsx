import Link from "next/link";

import { ListingTypeBadge } from "@/components/listing-type-badge";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallHero, MallWidth } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatMoney, stallById } from "@/lib/commerce";
import { isStallPacked } from "@/lib/packed-stall";
import { listingPath, stallPath, stallsWatchPath, watchedPath } from "@/lib/paths";
import { stillHereOnStall } from "@/lib/watched-stalls";
import { cn } from "@/lib/utils";

function DropTableButton({ stallId }: { stallId: string }) {
  return (
    <form action={stallsWatchPath()} method="post" className="w-full sm:w-auto">
      <input type="hidden" name="stallId" value={stallId} />
      <input type="hidden" name="intent" value="drop" />
      <input type="hidden" name="returnTo" value={watchedPath()} />
      <button
        type="submit"
        className={cn(
          buttonVariants({ variant: "ghost", size: "lg" }),
          "w-full rounded-full px-5 sm:w-auto",
        )}
      >
        Drop this table
      </button>
    </form>
  );
}

export function WatchedTables({
  stallIds,
  packed,
}: {
  stallIds: string[];
  packed?: boolean;
}) {
  const rows = stallIds.map((id) => {
    const stall = stallById(id);
    const stillHere = stall ? stillHereOnStall(stall.id) : [];
    return { id, stall, stillHere };
  });

  return (
    <div>
      <MallHero>
        <MallCrumb label="Watched tables">
          <CrumbSep />
          <span className="text-foreground">Watched tables</span>
        </MallCrumb>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full">
            Booths, not SKUs.
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {`${rows.length} ${rows.length === 1 ? "table" : "tables"}`}
          </Badge>
        </div>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Watched tables
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Same folding tables. Next weekend.
          </p>
        </div>
        {packed ? (
          <MallNotice
            padded={false}
            tone="missing"
            titleAs="h2"
            eyebrow="Not on the map"
            title="That stall packed up."
            body="No booth with that id. The folding table is gone, or the name is wrong."
          />
        ) : null}
      </MallHero>

      <MallWidth className="flex flex-col gap-8 py-12 sm:py-16">
        <ul className="space-y-4">
          {rows.map(({ id, stall, stillHere }) => {
            if (!stall) {
              return (
                <li
                  key={id}
                  data-watched-stall={id}
                  className="rounded-2xl bg-muted/50 p-5 ring-1 ring-foreground/10"
                >
                  <MallNotice
                    padded={false}
                    tone="missing"
                    titleAs="h2"
                    eyebrow="Not on the map"
                    title="That stall packed up."
                    body="No booth with that id. Drop it from this walk."
                  />
                  <div className="mt-4">
                    <DropTableButton stallId={id} />
                  </div>
                </li>
              );
            }

            return (
              <li
                key={id}
                data-watched-stall={stall.id}
                className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    Independent stall
                  </Badge>
                  <Badge variant="outline" className="rounded-full">
                    {`${stillHere.length} still here`}
                  </Badge>
                </div>
                <h2 className="mt-3 font-heading text-2xl leading-snug tracking-tight">
                  <Link
                    href={stallPath(stall.slug)}
                    className="underline-offset-4 hover:underline"
                  >
                    {stall.boothName}
                  </Link>
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {stall.blurb}
                </p>
                {isStallPacked(stall.id) ? (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    This booth packed up. Files in the folder still exist. Come
                    next weekend. The table went in the car. Not a refund. Not a
                    sold sticker.
                  </p>
                ) : null}
                {stillHere.length === 0 ? (
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    Nothing still here on this table. Sold and file-gone stay
                    off the walk.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {stillHere.map((listing) => (
                      <li
                        key={listing.id}
                        data-still-here={listing.id}
                        className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <ListingTypeBadge listing={listing} />
                          <Link
                            href={listingPath(listing.id)}
                            className="font-medium underline-offset-4 hover:underline"
                          >
                            {listing.title}
                          </Link>
                        </div>
                        <p className="font-heading text-base">
                          {formatMoney(listing.price)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-5">
                  <DropTableButton stallId={stall.id} />
                </div>
              </li>
            );
          })}
        </ul>
      </MallWidth>
    </div>
  );
}
