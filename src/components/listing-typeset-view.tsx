import Link from "next/link";

import { ListingTypesetEmpty } from "@/components/listing-typeset-empty";
import { SyncTypeset } from "@/components/listing-typeset-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  TYPESET_MIRROR_SCRIPT,
  TYPESET_NOTICE_TITLE,
  TYPESET_PAGE_LINE,
  TYPESET_REFUSE_COPY,
  TYPESET_STILL_LINE,
  TYPESET_TABLE_LINE,
  TYPESET_TOTE_LINE,
  TYPESET_WORKBOOK_LINE,
} from "@/lib/listing-typeset";
import { listingPath, listingTypesetWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type TypesetViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type TypesetViewSheet = {
  kind: TypesetViewKind;
  listingId: string;
  isTypeset: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function TypesetMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={TYPESET_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function TypesetRefused({ sheet }: { sheet: TypesetViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-typeset-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={TYPESET_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "I will not typeset is for a file on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {TYPESET_NOTICE_TITLE} {TYPESET_WORKBOOK_LINE} {TYPESET_STILL_LINE}
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

function TypesetForm({
  listingId,
  isTypeset,
}: {
  listingId: string;
  isTypeset: boolean;
}) {
  return (
    <form
      method="post"
      action={listingTypesetWritePath()}
      className="space-y-3"
      data-typeset-form={isTypeset ? "open" : "typeset"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isTypeset ? "open" : "typeset"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/typeset`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isTypeset ? "Leave the page" : "I will not typeset"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isTypeset
          ? "Clear the typeset paper. Status and the tote stay put."
          : `${TYPESET_PAGE_LINE} ${TYPESET_WORKBOOK_LINE} ${TYPESET_STILL_LINE} ${TYPESET_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingTypesetView({
  sheet,
  typesetIds,
}: {
  sheet: TypesetViewSheet;
  typesetIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <TypesetMissing />;
  }

  if (sheet.kind !== "digital") {
    return <TypesetRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-typeset-sheet="digital"
      data-typeset-state={sheet.isTypeset ? "typeset" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: TYPESET_MIRROR_SCRIPT }} />
      <SyncTypeset listingIds={typesetIds} />

      <MallHero>
        <MallCrumb label="I will not typeset">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Typeset</span>
        </MallCrumb>

        <MallEyebrow>I will not typeset</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isTypeset ? TYPESET_NOTICE_TITLE : TYPESET_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {TYPESET_NOTICE_TITLE} {TYPESET_WORKBOOK_LINE} {TYPESET_STILL_LINE}{" "}
            {TYPESET_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-typeset-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isTypeset ? (
              <Badge variant="outline">I will not typeset</Badge>
            ) : (
              <Badge variant="ghost">Still a folding-table page</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Typeset paper
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
            {sheet.isTypeset
              ? "Still for sale. Seller taped that the page stays a folding-table page. Walkers still ask Tuesday to typeset it. Status stays available."
              : "Written on a folding table. Tape it when walkers still want a Canva ebook."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isTypeset ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not typeset"
              title={TYPESET_NOTICE_TITLE}
              body={`${TYPESET_STILL_LINE} avail=open still lists this file. ${TYPESET_PAGE_LINE}`}
            />
          ) : (
            <ListingTypesetEmpty listingId={sheet.listingId} />
          )}

          <TypesetForm listingId={sheet.listingId} isTypeset={sheet.isTypeset} />

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
