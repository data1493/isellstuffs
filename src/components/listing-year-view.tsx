import Link from "next/link";

import { ListingYearEmpty } from "@/components/listing-year-empty";
import { SyncYear } from "@/components/listing-year-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  YEAR_MIRROR_SCRIPT,
  YEAR_NOTICE_TITLE,
  YEAR_PAGE_LINE,
  YEAR_REFUSE_COPY,
  YEAR_STILL_LINE,
  YEAR_SUMMER_LINE,
  YEAR_TABLE_LINE,
  YEAR_TOTE_LINE,
  YEAR_WALK_LINE,
} from "@/lib/listing-year";
import { listingPath, listingYearWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type YearViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type YearViewSheet = {
  kind: YearViewKind;
  listingId: string;
  isYear: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function YearMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={YEAR_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function YearRefused({ sheet }: { sheet: YearViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-year-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={YEAR_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "I will not date it is for a file on the digital lot, not a cassette and not a gift code."
              )}
            </p>
            <p>
              {YEAR_NOTICE_TITLE} {YEAR_WALK_LINE} {YEAR_STILL_LINE}
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

function YearForm({
  listingId,
  isYear,
}: {
  listingId: string;
  isYear: boolean;
}) {
  return (
    <form
      method="post"
      action={listingYearWritePath()}
      className="space-y-3"
      data-year-form={isYear ? "open" : "year"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isYear ? "open" : "year"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/year`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isYear ? "Leave it summer-ish" : "I will not date it"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isYear
          ? "Clear the year paper. Status and the tote stay put."
          : `${YEAR_SUMMER_LINE} ${YEAR_PAGE_LINE} ${YEAR_WALK_LINE} ${YEAR_STILL_LINE} ${YEAR_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingYearView({
  sheet,
  yearIds,
}: {
  sheet: YearViewSheet;
  yearIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <YearMissing />;
  }

  if (sheet.kind !== "digital") {
    return <YearRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-year-sheet="digital"
      data-year-state={sheet.isYear ? "year" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: YEAR_MIRROR_SCRIPT }} />
      <SyncYear listingIds={yearIds} />

      <MallHero>
        <MallCrumb label="I will not date it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Year</span>
        </MallCrumb>

        <MallEyebrow>I will not date it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isYear ? YEAR_NOTICE_TITLE : YEAR_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {YEAR_NOTICE_TITLE} {YEAR_WALK_LINE} {YEAR_STILL_LINE} {YEAR_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-year-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isYear ? (
              <Badge variant="outline">I will not date it</Badge>
            ) : (
              <Badge variant="ghost">Still a page</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Year paper
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
            {sheet.isYear
              ? "Still for sale. Seller taped that the liner stays summer-ish. Walkers still ask Sunday Crate which year. Status stays available."
              : "Summer-ish. Tape it when walkers still want a year on the page."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isYear ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not date it"
              title={YEAR_NOTICE_TITLE}
              body={`${YEAR_STILL_LINE} avail=open still lists this file. ${YEAR_SUMMER_LINE}`}
            />
          ) : (
            <ListingYearEmpty listingId={sheet.listingId} />
          )}

          <YearForm listingId={sheet.listingId} isYear={sheet.isYear} />

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
