import Link from "next/link";

import { ListingInsideEmpty } from "@/components/listing-inside-empty";
import { SyncInside } from "@/components/listing-inside-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  INSIDE_ARRIVED_LINE,
  INSIDE_MIRROR_SCRIPT,
  INSIDE_NOTICE_TITLE,
  INSIDE_REFUSE_COPY,
  INSIDE_STAYS_LINE,
  INSIDE_STILL_LINE,
  INSIDE_TABLE_LINE,
  INSIDE_TOTE_LINE,
  INSIDE_WALK_LINE,
} from "@/lib/listing-inside";
import { listingInsideWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type InsideViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type InsideViewSheet = {
  kind: InsideViewKind;
  listingId: string;
  isInside: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function InsideMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={INSIDE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function InsideRefused({ sheet }: { sheet: InsideViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-inside-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={INSIDE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "An inside note is for empty jewels on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {INSIDE_TABLE_LINE} {INSIDE_ARRIVED_LINE} {INSIDE_STILL_LINE}
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

function InsideForm({
  listingId,
  isInside,
}: {
  listingId: string;
  isInside: boolean;
}) {
  return (
    <form
      method="post"
      action={listingInsideWritePath()}
      className="space-y-3"
      data-inside-form={isInside ? "open" : "inside"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isInside ? "open" : "inside"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/inside`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isInside ? "Leave the empties" : "I will not say what was inside"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isInside
          ? "Clear the tape. Status and the tote stay put."
          : `${INSIDE_STAYS_LINE} ${INSIDE_ARRIVED_LINE} ${INSIDE_STILL_LINE} ${INSIDE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingInsideView({
  sheet,
  insideIds,
}: {
  sheet: InsideViewSheet;
  insideIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <InsideMissing />;
  }

  if (sheet.kind !== "physical") {
    return <InsideRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-inside-sheet="physical"
      data-inside-state={sheet.isInside ? "inside" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: INSIDE_MIRROR_SCRIPT }} />
      <SyncInside listingIds={insideIds} />

      <MallHero>
        <MallCrumb label="I will not say what was inside">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Inside</span>
        </MallCrumb>

        <MallEyebrow>Inside note</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isInside ? INSIDE_NOTICE_TITLE : INSIDE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {INSIDE_NOTICE_TITLE} {INSIDE_WALK_LINE} {INSIDE_STAYS_LINE}{" "}
            {INSIDE_STILL_LINE} {INSIDE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-inside-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isInside ? (
              <Badge variant="outline">I will not say what was inside</Badge>
            ) : (
              <Badge variant="ghost">Inside not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Inside tag
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
            {sheet.isInside
              ? "Still for sale. Seller taped the inside note. Status stays available. Not a fourth status."
              : "Empty jewels stay untitled. Tape the note when walkers still want the missing movies named."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isInside ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not say what was inside"
              title={INSIDE_NOTICE_TITLE}
              body={`${INSIDE_STAYS_LINE} ${INSIDE_ARRIVED_LINE} ${INSIDE_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingInsideEmpty listingId={sheet.listingId} />
          )}

          <InsideForm listingId={sheet.listingId} isInside={sheet.isInside} />

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
