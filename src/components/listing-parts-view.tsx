import Link from "next/link";

import { SyncParts } from "@/components/listing-parts-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  PARTS_DEMO_LINE,
  PARTS_EMPTY_LINE,
  PARTS_MIRROR_SCRIPT,
  PARTS_REFUSE_COPY,
  PARTS_RUN_LINE,
  PARTS_STILL_LINE,
  PARTS_TABLE_LINE,
  PARTS_TOTE_LINE,
} from "@/lib/listing-parts";
import { listingPath, listingPartsWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type PartsViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type PartsViewSheet = {
  kind: PartsViewKind;
  listingId: string;
  isParts: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function PartsMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={PARTS_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function PartsRefused({ sheet }: { sheet: PartsViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <MallNotice
      tone="empty"
      eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
      title={PARTS_REFUSE_COPY}
      body={
        <div className="space-y-2" data-parts-sheet={sheet.kind}>
          <p>
            {sheet.fact ? (
              <>
                <span className="font-medium text-foreground">{sheet.fact}</span>
                {sheet.stallName ? <> · {sheet.stallName}</> : null}
              </>
            ) : (
              "Parts honesty is for a tangle on the table, not a PDF and not a gift code."
            )}
          </p>
          <p>
            {PARTS_TABLE_LINE} {PARTS_RUN_LINE} {PARTS_STILL_LINE}
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
  );
}

function PartsForm({
  listingId,
  isParts,
}: {
  listingId: string;
  isParts: boolean;
}) {
  return (
    <form
      method="post"
      action={listingPartsWritePath()}
      className="space-y-3"
      data-parts-form={isParts ? "open" : "parts"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isParts ? "open" : "parts"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/parts`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isParts ? "It might run" : "Sold for parts"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isParts
          ? "Clear the tape. Status and the tote stay put."
          : `${PARTS_RUN_LINE} ${PARTS_STILL_LINE} ${PARTS_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingPartsView({
  sheet,
  partsIds,
}: {
  sheet: PartsViewSheet;
  partsIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <PartsMissing />;
  }

  if (sheet.kind !== "physical") {
    return <PartsRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-parts-sheet="physical"
      data-parts-state={sheet.isParts ? "parts" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: PARTS_MIRROR_SCRIPT }} />
      <SyncParts listingIds={partsIds} />

      <MallHero>
        <MallCrumb label="Sold for parts">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Parts</span>
        </MallCrumb>

        <MallEyebrow>Parts honesty</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isParts ? PARTS_TABLE_LINE : "Sold for parts."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {PARTS_TABLE_LINE} {PARTS_RUN_LINE} {PARTS_STILL_LINE}{" "}
            {PARTS_TOTE_LINE} {PARTS_DEMO_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-parts-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isParts ? (
              <Badge variant="outline">Sold for parts</Badge>
            ) : (
              <Badge variant="ghost">It might run</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Parts tag
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
            {sheet.isParts
              ? "Still for sale. Seller taped parts. Status stays available. Not a fourth status."
              : "Tested, kinda pressed start. Tape parts when the tangle will not demo."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isParts ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Sold for parts"
              title={PARTS_TABLE_LINE}
              body={`${PARTS_RUN_LINE} ${PARTS_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="It might run"
              title={PARTS_EMPTY_LINE}
              body="Tape sold-for-parts when the tangle will not demo. It does not drop the tote or mark it sold."
            />
          )}

          <PartsForm listingId={sheet.listingId} isParts={sheet.isParts} />

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
