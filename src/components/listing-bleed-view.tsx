import Link from "next/link";

import { ListingBleedEmpty } from "@/components/listing-bleed-empty";
import { SyncBleed } from "@/components/listing-bleed-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  BLEED_LEAVE_LINE,
  BLEED_MIRROR_SCRIPT,
  BLEED_NOTICE_TITLE,
  BLEED_PAGE_LINE,
  BLEED_REFUSE_COPY,
  BLEED_STAYS_LINE,
  BLEED_STILL_LINE,
  BLEED_TABLE_LINE,
  BLEED_TOTE_LINE,
  BLEED_WALK_LINE,
  BLEED_WRONG_LINE,
} from "@/lib/listing-bleed";
import { listingBleedWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type BleedViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "owned";

export type BleedViewSheet = {
  kind: BleedViewKind;
  listingId: string;
  isBleed: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function BleedMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={BLEED_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function BleedRefused({ sheet }: { sheet: BleedViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const owned = sheet.kind === "owned";

  return (
    <div data-bleed-sheet={sheet.kind}>
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
        title={BLEED_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A bleed note is for one liner page, not a jacket and not a gift code."
              )}
            </p>
            <p>
              {BLEED_TABLE_LINE} {BLEED_PAGE_LINE} {BLEED_WRONG_LINE}{" "}
              {BLEED_STILL_LINE}
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

function BleedForm({
  listingId,
  isBleed,
}: {
  listingId: string;
  isBleed: boolean;
}) {
  return (
    <form
      method="post"
      action={listingBleedWritePath()}
      className="space-y-3"
      data-bleed-form={isBleed ? "open" : "bleed"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isBleed ? "open" : "bleed"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/bleed`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isBleed ? BLEED_LEAVE_LINE : BLEED_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isBleed
          ? "Clear the tape. Status and the tote stay put."
          : `${BLEED_STAYS_LINE} ${BLEED_PAGE_LINE} ${BLEED_WRONG_LINE} ${BLEED_STILL_LINE} ${BLEED_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingBleedView({
  sheet,
  bleedIds,
}: {
  sheet: BleedViewSheet;
  bleedIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <BleedMissing />;
  }

  if (sheet.kind !== "digital") {
    return <BleedRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-bleed-sheet="digital"
      data-bleed-state={sheet.isBleed ? "bleed" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: BLEED_MIRROR_SCRIPT }} />
      <SyncBleed listingIds={bleedIds} />

      <MallHero>
        <MallCrumb label="I will not bleed it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Bleed</span>
        </MallCrumb>

        <MallEyebrow>I will not bleed it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isBleed ? BLEED_NOTICE_TITLE : BLEED_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {BLEED_TABLE_LINE} {BLEED_PAGE_LINE} {BLEED_WRONG_LINE}{" "}
            {BLEED_WALK_LINE} {BLEED_STAYS_LINE} {BLEED_STILL_LINE}{" "}
            {BLEED_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-bleed-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isBleed ? (
              <Badge variant="outline">I will not bleed it</Badge>
            ) : (
              <Badge variant="ghost">Still one page</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Bleed paper
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
            {sheet.isBleed
              ? "Still for sale. Seller taped the bleed note. Status stays available. Not a copy-shop trim."
              : "Still one page. Still wrong. Tape it when walkers still want the copy-shop trim."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isBleed ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not bleed it"
              title={BLEED_NOTICE_TITLE}
              body={`${BLEED_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingBleedEmpty listingId={sheet.listingId} />
          )}

          <BleedForm listingId={sheet.listingId} isBleed={sheet.isBleed} />

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
