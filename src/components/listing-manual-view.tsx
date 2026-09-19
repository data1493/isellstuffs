import Link from "next/link";

import { ListingManualEmpty } from "@/components/listing-manual-empty";
import { SyncManual } from "@/components/listing-manual-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  MANUAL_BOOK_LINE,
  MANUAL_BOX_LINE,
  MANUAL_FIGURE_LINE,
  MANUAL_MIRROR_SCRIPT,
  MANUAL_PAPER_LINE,
  MANUAL_REFUSE_COPY,
  MANUAL_STILL_LINE,
  MANUAL_TABLE_LINE,
  MANUAL_TOTE_LINE,
} from "@/lib/listing-manual";
import { listingManualWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type ManualViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type ManualViewSheet = {
  kind: ManualViewKind;
  listingId: string;
  isManual: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function ManualMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={MANUAL_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function ManualRefused({ sheet }: { sheet: ManualViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-manual-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={MANUAL_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Manual honesty is for a gadget on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {MANUAL_TABLE_LINE} {MANUAL_PAPER_LINE} {MANUAL_STILL_LINE}
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

function ManualForm({
  listingId,
  isManual,
}: {
  listingId: string;
  isManual: boolean;
}) {
  return (
    <form
      method="post"
      action={listingManualWritePath()}
      className="space-y-3"
      data-manual-form={isManual ? "open" : "manual"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isManual ? "open" : "manual"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/manual`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isManual ? "Paper's in the box" : "There is no manual"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isManual
          ? "Clear the tape. Status and the tote stay put."
          : `${MANUAL_PAPER_LINE} ${MANUAL_FIGURE_LINE} ${MANUAL_STILL_LINE} ${MANUAL_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingManualView({
  sheet,
  manualIds,
}: {
  sheet: ManualViewSheet;
  manualIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <ManualMissing />;
  }

  if (sheet.kind !== "physical") {
    return <ManualRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-manual-sheet="physical"
      data-manual-state={sheet.isManual ? "manual" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: MANUAL_MIRROR_SCRIPT }} />
      <SyncManual listingIds={manualIds} />

      <MallHero>
        <MallCrumb label="There is no manual">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Manual</span>
        </MallCrumb>

        <MallEyebrow>Manual honesty</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isManual ? MANUAL_TABLE_LINE : "There is no manual."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {MANUAL_TABLE_LINE} {MANUAL_PAPER_LINE} {MANUAL_FIGURE_LINE}{" "}
            {MANUAL_STILL_LINE} {MANUAL_TOTE_LINE} {MANUAL_BOOK_LINE}{" "}
            {MANUAL_BOX_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-manual-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isManual ? (
              <Badge variant="outline">There is no manual</Badge>
            ) : (
              <Badge variant="ghost">Paper in the box</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Manual tag
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
            {sheet.isManual
              ? "Still for sale. Seller taped the missing paper. Status stays available. Not a fourth status."
              : "Booklet is liner notes. Tape the manual when the instruction paper already walked."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isManual ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="There is no manual"
              title={MANUAL_TABLE_LINE}
              body={`${MANUAL_PAPER_LINE} ${MANUAL_FIGURE_LINE} ${MANUAL_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingManualEmpty listingId={sheet.listingId} />
          )}

          <ManualForm listingId={sheet.listingId} isManual={sheet.isManual} />

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
