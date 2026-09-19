import Link from "next/link";

import { ListingBurnishEmpty } from "@/components/listing-burnish-empty";
import { SyncBurnish } from "@/components/listing-burnish-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  BURNISH_LEAVE_LINE,
  BURNISH_MIRROR_SCRIPT,
  BURNISH_NOTICE_TITLE,
  BURNISH_PAIR_LINE,
  BURNISH_PEEL_LINE,
  BURNISH_REFUSE_COPY,
  BURNISH_STAYS_LINE,
  BURNISH_STILL_LINE,
  BURNISH_TABLE_LINE,
  BURNISH_TOTE_LINE,
  BURNISH_WALK_LINE,
} from "@/lib/listing-burnish";
import { listingBurnishWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type BurnishViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type BurnishViewSheet = {
  kind: BurnishViewKind;
  listingId: string;
  isBurnish: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function BurnishMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={BURNISH_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function BurnishRefused({ sheet }: { sheet: BurnishViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-burnish-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={BURNISH_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A burnish note is for a pair on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {BURNISH_TABLE_LINE} {BURNISH_PAIR_LINE} {BURNISH_PEEL_LINE}{" "}
              {BURNISH_STILL_LINE}
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

function BurnishForm({
  listingId,
  isBurnish,
}: {
  listingId: string;
  isBurnish: boolean;
}) {
  return (
    <form
      method="post"
      action={listingBurnishWritePath()}
      className="space-y-3"
      data-burnish-form={isBurnish ? "open" : "burnish"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isBurnish ? "open" : "burnish"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/burnish`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isBurnish ? BURNISH_LEAVE_LINE : BURNISH_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isBurnish
          ? "Clear the tape. Status and the tote stay put."
          : `${BURNISH_STAYS_LINE} ${BURNISH_PAIR_LINE} ${BURNISH_PEEL_LINE} ${BURNISH_STILL_LINE} ${BURNISH_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingBurnishView({
  sheet,
  burnishIds,
}: {
  sheet: BurnishViewSheet;
  burnishIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <BurnishMissing />;
  }

  if (sheet.kind !== "physical") {
    return <BurnishRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-burnish-sheet="physical"
      data-burnish-state={sheet.isBurnish ? "burnish" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: BURNISH_MIRROR_SCRIPT }} />
      <SyncBurnish listingIds={burnishIds} />

      <MallHero>
        <MallCrumb label="I will not burnish it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Burnish</span>
        </MallCrumb>

        <MallEyebrow>I will not burnish it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isBurnish ? BURNISH_NOTICE_TITLE : BURNISH_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {BURNISH_TABLE_LINE} {BURNISH_PAIR_LINE} {BURNISH_PEEL_LINE}{" "}
            {BURNISH_WALK_LINE} {BURNISH_STAYS_LINE} {BURNISH_STILL_LINE}{" "}
            {BURNISH_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-burnish-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isBurnish ? (
              <Badge variant="outline">I will not burnish it</Badge>
            ) : (
              <Badge variant="ghost">Burnish not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Burnish paper
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
            {sheet.isBurnish
              ? "Still for sale. Seller taped the burnish note. Status stays available. Not a cobbler."
              : "Still a pair. Still peeling. Tape it when walkers still want the edge burnished."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isBurnish ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not burnish it"
              title={BURNISH_NOTICE_TITLE}
              body={`${BURNISH_STILL_LINE} avail=open still lists this pair.`}
            />
          ) : (
            <ListingBurnishEmpty listingId={sheet.listingId} />
          )}

          <BurnishForm listingId={sheet.listingId} isBurnish={sheet.isBurnish} />

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
