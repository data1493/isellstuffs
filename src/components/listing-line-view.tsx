import Link from "next/link";

import { ListingLineEmpty } from "@/components/listing-line-empty";
import { SyncLine } from "@/components/listing-line-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  LINE_CELLS_LINE,
  LINE_MIRROR_SCRIPT,
  LINE_PRESS_LINE,
  LINE_REFUSE_COPY,
  LINE_SCREEN_LINE,
  LINE_STILL_LINE,
  LINE_TABLE_LINE,
  LINE_TOTE_LINE,
} from "@/lib/listing-line";
import { listingLineWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type LineViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type LineViewSheet = {
  kind: LineViewKind;
  listingId: string;
  isLine: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function LineMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={LINE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function LineRefused({ sheet }: { sheet: LineViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-line-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={LINE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Screen-line honesty is for a handheld on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {LINE_TABLE_LINE} {LINE_CELLS_LINE} {LINE_STILL_LINE}
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

function LineForm({
  listingId,
  isLine,
}: {
  listingId: string;
  isLine: boolean;
}) {
  return (
    <form
      method="post"
      action={listingLineWritePath()}
      className="space-y-3"
      data-line-form={isLine ? "open" : "line"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isLine ? "open" : "line"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/line`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isLine ? "The screen is clean" : "The line stays"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isLine
          ? "Clear the tape. Status and the tote stay put."
          : `${LINE_PRESS_LINE} ${LINE_SCREEN_LINE} ${LINE_STILL_LINE} ${LINE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingLineView({
  sheet,
  lineIds,
}: {
  sheet: LineViewSheet;
  lineIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <LineMissing />;
  }

  if (sheet.kind !== "physical") {
    return <LineRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-line-sheet="physical"
      data-line-state={sheet.isLine ? "line" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: LINE_MIRROR_SCRIPT }} />
      <SyncLine listingIds={lineIds} />

      <MallHero>
        <MallCrumb label="The line stays">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Line</span>
        </MallCrumb>

        <MallEyebrow>Screen-line honesty</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isLine ? LINE_TABLE_LINE : "The line stays."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {LINE_TABLE_LINE} {LINE_CELLS_LINE} {LINE_SCREEN_LINE}{" "}
            {LINE_PRESS_LINE} {LINE_STILL_LINE} {LINE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-line-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isLine ? (
              <Badge variant="outline">The line stays</Badge>
            ) : (
              <Badge variant="ghost">No screen line</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Line tag
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
            {sheet.isLine
              ? "Still for sale. Seller taped the screen line. Status stays available. Not a fourth status."
              : "Cells are out. Fix is I don't solder. Tape the line when the handheld already has one."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isLine ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="The line stays"
              title={LINE_TABLE_LINE}
              body={`${LINE_PRESS_LINE} ${LINE_SCREEN_LINE} ${LINE_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingLineEmpty listingId={sheet.listingId} />
          )}

          <LineForm listingId={sheet.listingId} isLine={sheet.isLine} />

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
