import Link from "next/link";

import { ListingHoodEmpty } from "@/components/listing-hood-empty";
import { SyncHood } from "@/components/listing-hood-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  HOOD_JACKET_LINE,
  HOOD_MIRROR_SCRIPT,
  HOOD_NOTICE_TITLE,
  HOOD_REFUSE_COPY,
  HOOD_SHELL_LINE,
  HOOD_STAYS_LINE,
  HOOD_STILL_LINE,
  HOOD_TABLE_LINE,
  HOOD_TOTE_LINE,
  HOOD_WALK_LINE,
} from "@/lib/listing-hood";
import { listingHoodWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type HoodViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type HoodViewSheet = {
  kind: HoodViewKind;
  listingId: string;
  isHood: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function HoodMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={HOOD_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function HoodRefused({ sheet }: { sheet: HoodViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-hood-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={HOOD_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A hood note is for a windbreaker on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {HOOD_TABLE_LINE} {HOOD_SHELL_LINE} {HOOD_JACKET_LINE} {HOOD_STILL_LINE}
            </p>
          </div>
        }
        actions={
          <>
            {sheet.listing ? (
              <Button
                className="h-11 w-full rounded-full px-5 sm:w-auto"
                render={<Link href={listingPath(sheet.listing.id)} />}
              >
                Back to the listing
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="h-11 w-full rounded-full px-5 sm:w-auto"
              render={<Link href="/explore" />}
            >
              Walk the concourse
            </Button>
          </>
        }
      />
    </div>
  );
}

function HoodForm({
  listingId,
  isHood,
}: {
  listingId: string;
  isHood: boolean;
}) {
  return (
    <form
      method="post"
      action={listingHoodWritePath()}
      className="space-y-3"
      data-hood-form={isHood ? "open" : "hood"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isHood ? "open" : "hood"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/hood`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isHood ? "Leave the shell" : "I don’t have a hood"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isHood
          ? "Clear the tape. Status and the tote stay put."
          : `${HOOD_STAYS_LINE} ${HOOD_SHELL_LINE} ${HOOD_STILL_LINE} ${HOOD_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingHoodView({
  sheet,
  hoodIds,
}: {
  sheet: HoodViewSheet;
  hoodIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <HoodMissing />;
  }

  if (sheet.kind !== "physical") {
    return <HoodRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-hood-sheet="physical"
      data-hood-state={sheet.isHood ? "hood" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: HOOD_MIRROR_SCRIPT }} />
      <SyncHood listingIds={hoodIds} />

      <MallHero>
        <MallCrumb label="I don’t have a hood">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Hood</span>
        </MallCrumb>

        <MallEyebrow>I don’t have a hood</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isHood ? HOOD_NOTICE_TITLE : HOOD_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {HOOD_TABLE_LINE} {HOOD_SHELL_LINE} {HOOD_JACKET_LINE} {HOOD_WALK_LINE}{" "}
            {HOOD_STAYS_LINE} {HOOD_STILL_LINE} {HOOD_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-hood-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isHood ? (
              <Badge variant="outline">I don’t have a hood</Badge>
            ) : (
              <Badge variant="ghost">Hood not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Hood paper
          </p>
          <p className="mt-1 font-heading text-5xl tracking-tight sm:text-6xl">
            {sheet.priceLabel ?? formatMoney(sheet.listing!.price)}
          </p>

          <h2 className="mt-3 font-heading text-2xl leading-snug tracking-tight text-balance">
            {sheet.title}
          </h2>

          {sheet.fact ? (
            <p className="mt-2 text-sm leading-6 text-foreground">{sheet.fact}</p>
          ) : null}

          <dl className="mt-5 grid gap-2 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Stall
              </dt>
              <dd className="mt-0.5 font-medium">{sheet.stallName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Aisle
              </dt>
              <dd className="mt-0.5 font-medium">{sheet.hubName}</dd>
            </div>
          </dl>

          <p className="mt-5 text-sm leading-6 text-foreground">
            {sheet.isHood
              ? "Still for sale. Seller taped the hood note. Status stays available. Not a tailor."
              : "Shell only. Still a jacket. Tape it when walkers still want a hood."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isHood ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don’t have a hood"
              title={HOOD_NOTICE_TITLE}
              body={`${HOOD_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingHoodEmpty listingId={sheet.listingId} />
          )}

          <HoodForm listingId={sheet.listingId} isHood={sheet.isHood} />

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="h-11 w-full rounded-full sm:w-auto"
              render={<Link href={listingPath(sheet.listingId)} />}
            >
              Back to the listing
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full rounded-full sm:w-auto"
              render={<Link href={exploreHref({ avail: "open" })} />}
            >
              Still here on the concourse
            </Button>
            {stallHref ? (
              <Button
                variant="outline"
                className="h-11 w-full rounded-full sm:w-auto"
                render={<Link href={stallHref} />}
              >
                Open the stall
              </Button>
            ) : null}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
