import Link from "next/link";

import { ListingPivotEmpty } from "@/components/listing-pivot-empty";
import { SyncPivot } from "@/components/listing-pivot-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  PIVOT_LEAVE_LINE,
  PIVOT_MIRROR_SCRIPT,
  PIVOT_NOTICE_TITLE,
  PIVOT_REFUSE_COPY,
  PIVOT_SKIP_LINE,
  PIVOT_STAYS_LINE,
  PIVOT_STILL_LINE,
  PIVOT_TABLE_LINE,
  PIVOT_TOTE_LINE,
  PIVOT_UNNAMED_LINE,
  PIVOT_WALK_LINE,
} from "@/lib/listing-pivot";
import { listingPath, listingPivotWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type PivotViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

export type PivotViewSheet = {
  kind: PivotViewKind;
  listingId: string;
  isPivot: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function PivotMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={PIVOT_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function PivotRefused({ sheet }: { sheet: PivotViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const mixtape = sheet.kind === "mixtape";
  const jewels = sheet.kind === "jewels";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-pivot-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : mixtape
                ? "A mixtape is not an LP"
                : jewels
                  ? "Empty jewels are not an LP"
                  : chair
                    ? "A chair is not an LP"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={PIVOT_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A pivot note is for the unnamed LP on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {PIVOT_TABLE_LINE} {PIVOT_SKIP_LINE} {PIVOT_UNNAMED_LINE}{" "}
              {PIVOT_STILL_LINE}
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

function PivotForm({
  listingId,
  isPivot,
}: {
  listingId: string;
  isPivot: boolean;
}) {
  return (
    <form
      method="post"
      action={listingPivotWritePath()}
      className="space-y-3"
      data-pivot-form={isPivot ? "open" : "pivot"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isPivot ? "open" : "pivot"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/pivot`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isPivot ? PIVOT_LEAVE_LINE : PIVOT_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isPivot
          ? "Clear the tape. Status and the tote stay put."
          : `${PIVOT_STAYS_LINE} ${PIVOT_SKIP_LINE} ${PIVOT_UNNAMED_LINE} ${PIVOT_STILL_LINE} ${PIVOT_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingPivotView({
  sheet,
  pivotIds,
}: {
  sheet: PivotViewSheet;
  pivotIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <PivotMissing />;
  }

  if (sheet.kind !== "physical") {
    return <PivotRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-pivot-sheet="physical"
      data-pivot-state={sheet.isPivot ? "pivot" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: PIVOT_MIRROR_SCRIPT }} />
      <SyncPivot listingIds={pivotIds} />

      <MallHero>
        <MallCrumb label="I will not pivot it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Pivot</span>
        </MallCrumb>

        <MallEyebrow>I will not pivot it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isPivot ? PIVOT_NOTICE_TITLE : PIVOT_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {PIVOT_TABLE_LINE} {PIVOT_SKIP_LINE} {PIVOT_UNNAMED_LINE}{" "}
            {PIVOT_WALK_LINE} {PIVOT_STAYS_LINE} {PIVOT_STILL_LINE}{" "}
            {PIVOT_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-pivot-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isPivot ? (
              <Badge variant="outline">I will not pivot it</Badge>
            ) : (
              <Badge variant="ghost">Pivot not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Pivot paper
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
            {sheet.isPivot
              ? "Still for sale. Seller taped the pivot note. Status stays available. Not a shop."
              : "Still a skip. Still unnamed. Tape it when walkers still want a shop pivot."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isPivot ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not pivot it"
              title={PIVOT_NOTICE_TITLE}
              body={`${PIVOT_STILL_LINE} avail=open still lists this LP.`}
            />
          ) : (
            <ListingPivotEmpty listingId={sheet.listingId} />
          )}

          <PivotForm listingId={sheet.listingId} isPivot={sheet.isPivot} />

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
