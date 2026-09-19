import Link from "next/link";

import { ListingGridEmpty } from "@/components/listing-grid-empty";
import { SyncGrid } from "@/components/listing-grid-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  GRID_MIRROR_SCRIPT,
  GRID_NOTICE_TITLE,
  GRID_ONE_LINE,
  GRID_REFUSE_COPY,
  GRID_RULE_LINE,
  GRID_STILL_LINE,
  GRID_TABLE_LINE,
  GRID_TOTE_LINE,
  GRID_WALK_LINE,
} from "@/lib/listing-grid";
import { listingGridWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type GridViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type GridViewSheet = {
  kind: GridViewKind;
  listingId: string;
  isGrid: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function GridMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={GRID_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button
          className="h-11 w-full rounded-full px-5 sm:w-auto"
          render={<Link href="/explore" />}
        >
          Walk the concourse
        </Button>
      }
    />
  );
}

function GridRefused({ sheet }: { sheet: GridViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-grid-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={GRID_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "I will not spreadsheet is for a file on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {GRID_NOTICE_TITLE} {GRID_WALK_LINE} {GRID_STILL_LINE}
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

function GridForm({
  listingId,
  isGrid,
}: {
  listingId: string;
  isGrid: boolean;
}) {
  return (
    <form
      method="post"
      action={listingGridWritePath()}
      className="space-y-3"
      data-grid-form={isGrid ? "open" : "grid"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isGrid ? "open" : "grid"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/grid`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isGrid ? "Leave the one page" : "I will not spreadsheet"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isGrid
          ? "Clear the grid paper. Status and the tote stay put."
          : `${GRID_ONE_LINE} ${GRID_RULE_LINE} ${GRID_WALK_LINE} ${GRID_STILL_LINE} ${GRID_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingGridView({
  sheet,
  gridIds,
}: {
  sheet: GridViewSheet;
  gridIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <GridMissing />;
  }

  if (sheet.kind !== "digital") {
    return <GridRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-grid-sheet="digital"
      data-grid-state={sheet.isGrid ? "grid" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: GRID_MIRROR_SCRIPT }} />
      <SyncGrid listingIds={gridIds} />

      <MallHero>
        <MallCrumb label="I will not spreadsheet">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Grid</span>
        </MallCrumb>

        <MallEyebrow>I will not spreadsheet</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isGrid ? GRID_NOTICE_TITLE : GRID_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {GRID_NOTICE_TITLE} {GRID_WALK_LINE} {GRID_STILL_LINE}{" "}
            {GRID_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-grid-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isGrid ? (
              <Badge variant="outline">I will not spreadsheet</Badge>
            ) : (
              <Badge variant="ghost">Still one page</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Grid paper
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
            {sheet.isGrid
              ? "Still for sale. Seller taped that the page stays one page. Walkers still ask Tuesday for a spreadsheet. Status stays available."
              : "One page. A rule of thumb. Tape it when walkers still want a grid they can sort."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isGrid ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not spreadsheet"
              title={GRID_NOTICE_TITLE}
              body={`${GRID_STILL_LINE} avail=open still lists this file. ${GRID_ONE_LINE}`}
            />
          ) : (
            <ListingGridEmpty listingId={sheet.listingId} />
          )}

          <GridForm listingId={sheet.listingId} isGrid={sheet.isGrid} />

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
