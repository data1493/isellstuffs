import Link from "next/link";

import { ListingDubEmpty } from "@/components/listing-dub-empty";
import { SyncDub } from "@/components/listing-dub-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  DUB_HISS_LINE,
  DUB_LEAVE_LINE,
  DUB_MIRROR_SCRIPT,
  DUB_NOTICE_TITLE,
  DUB_RADIO_LINE,
  DUB_REFUSE_COPY,
  DUB_STAYS_LINE,
  DUB_STILL_LINE,
  DUB_TABLE_LINE,
  DUB_TOTE_LINE,
  DUB_WALK_LINE,
} from "@/lib/listing-dub";
import { listingDubWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type DubViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type DubViewSheet = {
  kind: DubViewKind;
  listingId: string;
  isDub: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function DubMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={DUB_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function DubRefused({ sheet }: { sheet: DubViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-dub-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={DUB_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A dub note is for a cassette on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {DUB_TABLE_LINE} {DUB_HISS_LINE} {DUB_RADIO_LINE} {DUB_STILL_LINE}
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

function DubForm({
  listingId,
  isDub,
}: {
  listingId: string;
  isDub: boolean;
}) {
  return (
    <form
      method="post"
      action={listingDubWritePath()}
      className="space-y-3"
      data-dub-form={isDub ? "open" : "dub"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isDub ? "open" : "dub"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/dub`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isDub ? DUB_LEAVE_LINE : DUB_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isDub
          ? "Clear the tape. Status and the tote stay put."
          : `${DUB_STAYS_LINE} ${DUB_HISS_LINE} ${DUB_RADIO_LINE} ${DUB_STILL_LINE} ${DUB_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingDubView({
  sheet,
  dubIds,
}: {
  sheet: DubViewSheet;
  dubIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <DubMissing />;
  }

  if (sheet.kind !== "physical") {
    return <DubRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-dub-sheet="physical"
      data-dub-state={sheet.isDub ? "dub" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: DUB_MIRROR_SCRIPT }} />
      <SyncDub listingIds={dubIds} />

      <MallHero>
        <MallCrumb label="I will not dub it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Dub</span>
        </MallCrumb>

        <MallEyebrow>I will not dub it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isDub ? DUB_NOTICE_TITLE : DUB_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {DUB_TABLE_LINE} {DUB_HISS_LINE} {DUB_RADIO_LINE} {DUB_WALK_LINE}{" "}
            {DUB_STAYS_LINE} {DUB_STILL_LINE} {DUB_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-dub-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isDub ? (
              <Badge variant="outline">I will not dub it</Badge>
            ) : (
              <Badge variant="ghost">Dub not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Dub paper
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
            {sheet.isDub
              ? "Still for sale. Seller taped the dub note. Status stays available. Not a tape shop."
              : "Still hiss. Still a radio edit. Tape it when walkers still want a clean SUMMER 93."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isDub ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not dub it"
              title={DUB_NOTICE_TITLE}
              body={`${DUB_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingDubEmpty listingId={sheet.listingId} />
          )}

          <DubForm listingId={sheet.listingId} isDub={sheet.isDub} />

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
