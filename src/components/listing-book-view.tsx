import Link from "next/link";

import { ListingBookEmpty } from "@/components/listing-book-empty";
import { SyncBook } from "@/components/listing-book-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  BOOK_CASES_LINE,
  BOOK_LINER_LINE,
  BOOK_MIRROR_SCRIPT,
  BOOK_REFUSE_COPY,
  BOOK_STILL_LINE,
  BOOK_TABLE_LINE,
  BOOK_TOTE_LINE,
} from "@/lib/listing-book";
import { listingBookWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type BookViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type BookViewSheet = {
  kind: BookViewKind;
  listingId: string;
  isBook: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function BookMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={BOOK_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function BookRefused({ sheet }: { sheet: BookViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-book-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={BOOK_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "The booklet walked is for liner notes missing from a jewel, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {BOOK_TABLE_LINE} {BOOK_LINER_LINE} {BOOK_CASES_LINE}{" "}
              {BOOK_STILL_LINE}
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

function BookForm({
  listingId,
  isBook,
}: {
  listingId: string;
  isBook: boolean;
}) {
  return (
    <form
      method="post"
      action={listingBookWritePath()}
      className="space-y-3"
      data-book-form={isBook ? "open" : "book"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isBook ? "open" : "book"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/book`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isBook ? "Booklet still in it" : "The booklet walked"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isBook
          ? "Clear the tape. Status and the tote stay put."
          : `${BOOK_LINER_LINE} ${BOOK_CASES_LINE} ${BOOK_STILL_LINE} ${BOOK_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingBookView({
  sheet,
  bookIds,
}: {
  sheet: BookViewSheet;
  bookIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <BookMissing />;
  }

  if (sheet.kind !== "physical") {
    return <BookRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-book-sheet="physical"
      data-book-state={sheet.isBook ? "book" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: BOOK_MIRROR_SCRIPT }} />
      <SyncBook listingIds={bookIds} />

      <MallHero>
        <MallCrumb label="The booklet walked">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Book</span>
        </MallCrumb>

        <MallEyebrow>Booklet</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isBook ? BOOK_TABLE_LINE : "The booklet walked."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {BOOK_TABLE_LINE} {BOOK_LINER_LINE} {BOOK_CASES_LINE}{" "}
            {BOOK_STILL_LINE} {BOOK_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-book-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isBook ? (
              <Badge variant="outline">The booklet walked</Badge>
            ) : (
              <Badge variant="ghost">No booklet tape</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Booklet tape
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
            {sheet.isBook
              ? "Still for sale. Seller taped the missing booklet. Walkers still bag it. Status stays available."
              : "Cases is the empty jewel. Scan is paper to a file. Tape the booklet when the liner notes walked."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isBook ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="The booklet walked"
              title={BOOK_TABLE_LINE}
              body={`${BOOK_LINER_LINE} ${BOOK_STILL_LINE} avail=open still lists this pile. ${BOOK_CASES_LINE}`}
            />
          ) : (
            <ListingBookEmpty listingId={sheet.listingId} />
          )}

          <BookForm listingId={sheet.listingId} isBook={sheet.isBook} />

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
