import Link from "next/link";

import { ListingWarpEmpty } from "@/components/listing-warp-empty";
import { SyncWarp } from "@/components/listing-warp-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  WARP_MIRROR_SCRIPT,
  WARP_NOTICE_TITLE,
  WARP_NOTE_LINE,
  WARP_PLAYS_LINE,
  WARP_REFUSE_COPY,
  WARP_STAYS_LINE,
  WARP_STILL_LINE,
  WARP_TABLE_LINE,
  WARP_TOTE_LINE,
  WARP_WALK_LINE,
} from "@/lib/listing-warp";
import { listingPath, listingWarpWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type WarpViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type WarpViewSheet = {
  kind: WarpViewKind;
  listingId: string;
  isWarp: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function WarpMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={WARP_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function WarpRefused({ sheet }: { sheet: WarpViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-warp-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={WARP_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A warp note is for an LP on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {WARP_TABLE_LINE} {WARP_STAYS_LINE} {WARP_PLAYS_LINE} {WARP_STILL_LINE}
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

function WarpForm({
  listingId,
  isWarp,
}: {
  listingId: string;
  isWarp: boolean;
}) {
  return (
    <form
      method="post"
      action={listingWarpWritePath()}
      className="space-y-3"
      data-warp-form={isWarp ? "open" : "warp"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isWarp ? "open" : "warp"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/warp`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isWarp ? "Leave the warp" : "I will not flatten"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isWarp
          ? "Clear the tape. Status and the tote stay put."
          : `${WARP_NOTE_LINE} ${WARP_PLAYS_LINE} ${WARP_STILL_LINE} ${WARP_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingWarpView({
  sheet,
  warpIds,
}: {
  sheet: WarpViewSheet;
  warpIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <WarpMissing />;
  }

  if (sheet.kind !== "physical") {
    return <WarpRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-warp-sheet="physical"
      data-warp-state={sheet.isWarp ? "warp" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: WARP_MIRROR_SCRIPT }} />
      <SyncWarp listingIds={warpIds} />

      <MallHero>
        <MallCrumb label="I will not flatten">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Warp</span>
        </MallCrumb>

        <MallEyebrow>I will not flatten</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isWarp ? WARP_NOTICE_TITLE : WARP_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {WARP_TABLE_LINE} {WARP_STAYS_LINE} {WARP_PLAYS_LINE} {WARP_WALK_LINE}{" "}
            {WARP_NOTE_LINE} {WARP_STILL_LINE} {WARP_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-warp-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isWarp ? (
              <Badge variant="outline">I will not flatten</Badge>
            ) : (
              <Badge variant="ghost">Warp not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Warp paper
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
            {sheet.isWarp
              ? "Still for sale. Seller taped the warp note. Status stays available. Not a press."
              : "Warp stays. Still plays. Tape it when walkers still want it under books."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isWarp ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not flatten"
              title={WARP_NOTICE_TITLE}
              body={`${WARP_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingWarpEmpty listingId={sheet.listingId} />
          )}

          <WarpForm listingId={sheet.listingId} isWarp={sheet.isWarp} />

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
