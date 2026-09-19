import Link from "next/link";

import { ListingCasesEmpty } from "@/components/listing-cases-empty";
import { SyncCases } from "@/components/listing-cases-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  CASES_JEWEL_LINE,
  CASES_MIRROR_SCRIPT,
  CASES_PLAYS_LINE,
  CASES_REFUSE_COPY,
  CASES_STILL_LINE,
  CASES_TABLE_LINE,
  CASES_TOTE_LINE,
  CASES_WRAP_LINE,
} from "@/lib/listing-cases";
import { listingCasesWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type CasesViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type CasesViewSheet = {
  kind: CasesViewKind;
  listingId: string;
  isCases: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function CasesMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={CASES_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function CasesRefused({ sheet }: { sheet: CasesViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-cases-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={CASES_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Empty case is for a jewel case on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {CASES_TABLE_LINE} {CASES_JEWEL_LINE} {CASES_PLAYS_LINE}{" "}
              {CASES_WRAP_LINE} {CASES_STILL_LINE}
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

function CasesForm({
  listingId,
  isCases,
}: {
  listingId: string;
  isCases: boolean;
}) {
  return (
    <form
      method="post"
      action={listingCasesWritePath()}
      className="space-y-3"
      data-cases-form={isCases ? "open" : "cases"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isCases ? "open" : "cases"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/cases`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isCases ? "Discs still in it" : "The discs walked"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isCases
          ? "Clear the tape. Status and the tote stay put."
          : `${CASES_JEWEL_LINE} ${CASES_PLAYS_LINE} ${CASES_WRAP_LINE} ${CASES_STILL_LINE} ${CASES_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingCasesView({
  sheet,
  casesIds,
}: {
  sheet: CasesViewSheet;
  casesIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <CasesMissing />;
  }

  if (sheet.kind !== "physical") {
    return <CasesRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-cases-sheet="physical"
      data-cases-state={sheet.isCases ? "cases" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: CASES_MIRROR_SCRIPT }} />
      <SyncCases listingIds={casesIds} />

      <MallHero>
        <MallCrumb label="The discs walked">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Cases</span>
        </MallCrumb>

        <MallEyebrow>Empty case</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isCases ? CASES_TABLE_LINE : "The discs walked."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {CASES_TABLE_LINE} {CASES_JEWEL_LINE} {CASES_PLAYS_LINE}{" "}
            {CASES_WRAP_LINE} {CASES_STILL_LINE} {CASES_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-cases-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isCases ? (
              <Badge variant="outline">The discs walked</Badge>
            ) : (
              <Badge variant="ghost">Discs still in it</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Empty case
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
            {sheet.isCases
              ? "Still for sale. Seller taped an empty jewel case. Walkers still bag it. Status stays available."
              : "Plays is how many times it spun. Tape the empty case when the discs walked."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isCases ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="The discs walked"
              title={CASES_TABLE_LINE}
              body={`${CASES_STILL_LINE} avail=open still lists this pile. ${CASES_JEWEL_LINE}`}
            />
          ) : (
            <ListingCasesEmpty listingId={sheet.listingId} />
          )}

          <CasesForm listingId={sheet.listingId} isCases={sheet.isCases} />

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
