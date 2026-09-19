import Link from "next/link";

import { ListingFlockEmpty } from "@/components/listing-flock-empty";
import { SyncFlock } from "@/components/listing-flock-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  FLOCK_CRACK_LINE,
  FLOCK_EMPTY_CASES_LINE,
  FLOCK_LEAVE_LINE,
  FLOCK_MIRROR_SCRIPT,
  FLOCK_NOTICE_TITLE,
  FLOCK_REFUSE_COPY,
  FLOCK_STAYS_LINE,
  FLOCK_STILL_LINE,
  FLOCK_TABLE_LINE,
  FLOCK_TOTE_LINE,
  FLOCK_WALK_LINE,
} from "@/lib/listing-flock";
import { listingFlockWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type FlockViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type FlockViewSheet = {
  kind: FlockViewKind;
  listingId: string;
  isFlock: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function FlockMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={FLOCK_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function FlockRefused({ sheet }: { sheet: FlockViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-flock-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={FLOCK_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A flock note is for empty jewels on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {FLOCK_TABLE_LINE} {FLOCK_EMPTY_CASES_LINE} {FLOCK_CRACK_LINE} {FLOCK_STILL_LINE}
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

function FlockForm({
  listingId,
  isFlock,
}: {
  listingId: string;
  isFlock: boolean;
}) {
  return (
    <form
      method="post"
      action={listingFlockWritePath()}
      className="space-y-3"
      data-flock-form={isFlock ? "open" : "flock"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isFlock ? "open" : "flock"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/flock`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isFlock ? FLOCK_LEAVE_LINE : FLOCK_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isFlock
          ? "Clear the tape. Status and the tote stay put."
          : `${FLOCK_STAYS_LINE} ${FLOCK_EMPTY_CASES_LINE} ${FLOCK_CRACK_LINE} ${FLOCK_STILL_LINE} ${FLOCK_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingFlockView({
  sheet,
  flockIds,
}: {
  sheet: FlockViewSheet;
  flockIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <FlockMissing />;
  }

  if (sheet.kind !== "physical") {
    return <FlockRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-flock-sheet="physical"
      data-flock-state={sheet.isFlock ? "flock" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: FLOCK_MIRROR_SCRIPT }} />
      <SyncFlock listingIds={flockIds} />

      <MallHero>
        <MallCrumb label="I will not flock them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Flock</span>
        </MallCrumb>

        <MallEyebrow>I will not flock them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isFlock ? FLOCK_NOTICE_TITLE : FLOCK_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {FLOCK_TABLE_LINE} {FLOCK_EMPTY_CASES_LINE} {FLOCK_CRACK_LINE} {FLOCK_WALK_LINE}{" "}
            {FLOCK_STAYS_LINE} {FLOCK_STILL_LINE} {FLOCK_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-flock-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isFlock ? (
              <Badge variant="outline">I will not flock them</Badge>
            ) : (
              <Badge variant="ghost">Flock not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Flock paper
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
            {sheet.isFlock
              ? "Still for sale. Seller taped the flock note. Status stays available. Not a closer."
              : "Still empty. Still one crack. Tape it when walkers still want the trays sueded."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isFlock ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not flock them"
              title={FLOCK_NOTICE_TITLE}
              body={`${FLOCK_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingFlockEmpty listingId={sheet.listingId} />
          )}

          <FlockForm listingId={sheet.listingId} isFlock={sheet.isFlock} />

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
