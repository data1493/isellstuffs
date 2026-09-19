import Link from "next/link";

import { ListingPlaysEmpty } from "@/components/listing-plays-empty";
import { SyncPlays } from "@/components/listing-plays-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  PLAYS_MIRROR_SCRIPT,
  PLAYS_PRESS_LINE,
  PLAYS_REFUSE_COPY,
  PLAYS_SPIN_LINE,
  PLAYS_STILL_LINE,
  PLAYS_TABLE_LINE,
  PLAYS_TOTE_LINE,
} from "@/lib/listing-plays";
import { listingPath, listingPlaysWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type PlaysViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type PlaysViewSheet = {
  kind: PlaysViewKind;
  listingId: string;
  isPlays: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function PlaysMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={PLAYS_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function PlaysRefused({ sheet }: { sheet: PlaysViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-plays-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={PLAYS_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Play count is for a record on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {PLAYS_TABLE_LINE} {PLAYS_PRESS_LINE} {PLAYS_SPIN_LINE}{" "}
              {PLAYS_STILL_LINE}
            </p>
          </div>
        }
        actions={
          <>
            {sheet.listing ? (
              <Button
                className="rounded-full px-5"
                render={<Link href={listingPath(sheet.listing.id)} />}
              >
                Back to the listing
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="rounded-full px-5"
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

function PlaysForm({
  listingId,
  isPlays,
}: {
  listingId: string;
  isPlays: boolean;
}) {
  return (
    <form
      method="post"
      action={listingPlaysWritePath()}
      className="space-y-3"
      data-plays-form={isPlays ? "open" : "plays"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isPlays ? "open" : "plays"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/plays`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isPlays ? "Never spun" : "I played it once"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isPlays
          ? "Clear the tape. Status and the tote stay put."
          : `${PLAYS_PRESS_LINE} ${PLAYS_SPIN_LINE} ${PLAYS_STILL_LINE} ${PLAYS_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingPlaysView({
  sheet,
  playsIds,
}: {
  sheet: PlaysViewSheet;
  playsIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <PlaysMissing />;
  }

  if (sheet.kind !== "physical") {
    return <PlaysRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-plays-sheet="physical"
      data-plays-state={sheet.isPlays ? "plays" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: PLAYS_MIRROR_SCRIPT }} />
      <SyncPlays listingIds={playsIds} />

      <MallHero>
        <MallCrumb label="I played it once">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Plays</span>
        </MallCrumb>

        <MallEyebrow>Play count</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isPlays ? PLAYS_TABLE_LINE : "I played it once."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {PLAYS_TABLE_LINE} {PLAYS_PRESS_LINE} {PLAYS_SPIN_LINE}{" "}
            {PLAYS_STILL_LINE} {PLAYS_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-plays-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isPlays ? (
              <Badge variant="outline">I played it once</Badge>
            ) : (
              <Badge variant="ghost">Never spun</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Play count
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
            {sheet.isPlays
              ? "Still for sale. Seller taped one play. Walkers still bag it. Status stays available."
              : "Press is which pressing. Tape the play when the needle already dropped."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isPlays ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I played it once"
              title={PLAYS_TABLE_LINE}
              body={`${PLAYS_STILL_LINE} avail=open still lists this pile. ${PLAYS_SPIN_LINE}`}
            />
          ) : (
            <ListingPlaysEmpty listingId={sheet.listingId} />
          )}

          <PlaysForm listingId={sheet.listingId} isPlays={sheet.isPlays} />

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={listingPath(sheet.listingId)} />}
            >
              Back to the listing
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={exploreHref({ avail: "open" })} />}
            >
              Still here on the concourse
            </Button>
            {stallHref ? (
              <Button
                variant="outline"
                className="w-full rounded-full sm:w-auto"
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
