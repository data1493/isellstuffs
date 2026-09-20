import Link from "next/link";

import { ListingGalleyEmpty } from "@/components/listing-galley-empty";
import { SyncGalley } from "@/components/listing-galley-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  GALLEY_LEAVE_LINE,
  GALLEY_MIRROR_SCRIPT,
  GALLEY_NOTICE_TITLE,
  GALLEY_PAGE_LINE,
  GALLEY_REFUSE_COPY,
  GALLEY_STAYS_LINE,
  GALLEY_STILL_LINE,
  GALLEY_TABLE_LINE,
  GALLEY_TOTE_LINE,
  GALLEY_WALK_LINE,
  GALLEY_WRONG_LINE,
} from "@/lib/listing-galley";
import { listingGalleyWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type GalleyViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "owned";

export type GalleyViewSheet = {
  kind: GalleyViewKind;
  listingId: string;
  isGalley: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function GalleyMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={GALLEY_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function GalleyRefused({ sheet }: { sheet: GalleyViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const owned = sheet.kind === "owned";

  return (
    <div data-galley-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : owned
              ? "Another note already owns that one"
              : object
                ? "On the table"
                : "Walked"
        }
        title={GALLEY_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A galley note is for one liner page, not a mixtape and not a gift code."
              )}
            </p>
            <p>
              {GALLEY_TABLE_LINE} {GALLEY_PAGE_LINE} {GALLEY_WRONG_LINE}{" "}
              {GALLEY_STILL_LINE}
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

function GalleyForm({
  listingId,
  isGalley,
}: {
  listingId: string;
  isGalley: boolean;
}) {
  return (
    <form
      method="post"
      action={listingGalleyWritePath()}
      className="space-y-3"
      data-galley-form={isGalley ? "open" : "galley"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isGalley ? "open" : "galley"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/galley`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isGalley ? GALLEY_LEAVE_LINE : GALLEY_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isGalley
          ? "Clear the tape. Status and the tote stay put."
          : `${GALLEY_STAYS_LINE} ${GALLEY_PAGE_LINE} ${GALLEY_WRONG_LINE} ${GALLEY_STILL_LINE} ${GALLEY_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingGalleyView({
  sheet,
  galleyIds,
}: {
  sheet: GalleyViewSheet;
  galleyIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <GalleyMissing />;
  }

  if (sheet.kind !== "digital") {
    return <GalleyRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-galley-sheet="digital"
      data-galley-state={sheet.isGalley ? "galley" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: GALLEY_MIRROR_SCRIPT }} />
      <SyncGalley listingIds={galleyIds} />

      <MallHero>
        <MallCrumb label="I will not galley it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Galley</span>
        </MallCrumb>

        <MallEyebrow>I will not galley it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isGalley ? GALLEY_NOTICE_TITLE : GALLEY_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {GALLEY_TABLE_LINE} {GALLEY_PAGE_LINE} {GALLEY_WRONG_LINE}{" "}
            {GALLEY_WALK_LINE} {GALLEY_STAYS_LINE} {GALLEY_STILL_LINE}{" "}
            {GALLEY_TOTE_LINE} Print proof, not a login. Register stays print
            bars.
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-galley-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isGalley ? (
              <Badge variant="outline">I will not galley it</Badge>
            ) : (
              <Badge variant="ghost">Still one page</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Galley paper
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
            {sheet.isGalley
              ? "Still for sale. Seller taped the galley note. Status stays available. Not a shop galley."
              : "Still one page. Still wrong on purpose. Tape it when walkers still want the shop galley."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isGalley ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not galley it"
              title={GALLEY_NOTICE_TITLE}
              body={`${GALLEY_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingGalleyEmpty listingId={sheet.listingId} />
          )}

          <GalleyForm listingId={sheet.listingId} isGalley={sheet.isGalley} />

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
