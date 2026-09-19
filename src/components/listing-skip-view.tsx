import Link from "next/link";

import { ListingSkipEmpty } from "@/components/listing-skip-empty";
import { SyncSkip } from "@/components/listing-skip-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  SKIP_MIRROR_SCRIPT,
  SKIP_PLAYS_LINE,
  SKIP_PRESS_LINE,
  SKIP_REFUSE_COPY,
  SKIP_SIDE_LINE,
  SKIP_STILL_LINE,
  SKIP_TABLE_LINE,
  SKIP_TOTE_LINE,
} from "@/lib/listing-skip";
import { listingPath, listingSkipWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type SkipViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type SkipViewSheet = {
  kind: SkipViewKind;
  listingId: string;
  isSkip: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function SkipMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={SKIP_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function SkipRefused({ sheet }: { sheet: SkipViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-skip-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={SKIP_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "The skip stays is for a record on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {SKIP_TABLE_LINE} {SKIP_PRESS_LINE} {SKIP_PLAYS_LINE}{" "}
              {SKIP_SIDE_LINE} {SKIP_STILL_LINE}
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

function SkipForm({
  listingId,
  isSkip,
}: {
  listingId: string;
  isSkip: boolean;
}) {
  return (
    <form
      method="post"
      action={listingSkipWritePath()}
      className="space-y-3"
      data-skip-form={isSkip ? "open" : "skip"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isSkip ? "open" : "skip"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/skip`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isSkip ? "Leave the groove" : "The skip stays"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isSkip
          ? "Clear the skip paper. Status and the tote stay put."
          : `${SKIP_PRESS_LINE} ${SKIP_PLAYS_LINE} ${SKIP_SIDE_LINE} ${SKIP_STILL_LINE} ${SKIP_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingSkipView({
  sheet,
  skipIds,
}: {
  sheet: SkipViewSheet;
  skipIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <SkipMissing />;
  }

  if (sheet.kind !== "physical") {
    return <SkipRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-skip-sheet="physical"
      data-skip-state={sheet.isSkip ? "skip" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: SKIP_MIRROR_SCRIPT }} />
      <SyncSkip listingIds={skipIds} />

      <MallHero>
        <MallCrumb label="The skip stays">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Skip</span>
        </MallCrumb>

        <MallEyebrow>The skip stays</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isSkip ? SKIP_TABLE_LINE : "The skip stays."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SKIP_TABLE_LINE} {SKIP_PRESS_LINE} {SKIP_PLAYS_LINE} {SKIP_SIDE_LINE}{" "}
            {SKIP_STILL_LINE} {SKIP_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-skip-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isSkip ? (
              <Badge variant="outline">The skip stays</Badge>
            ) : (
              <Badge variant="ghost">Leave the groove</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Skip paper
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
            {sheet.isSkip
              ? "Still for sale. Seller taped the skip. Walkers still want a clean Side A. Status stays available."
              : "Press is which pressing. Plays is how many times it spun. Tape the skip when Side A stays scratched."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isSkip ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="The skip stays"
              title={SKIP_TABLE_LINE}
              body={`${SKIP_STILL_LINE} avail=open still lists this pile. ${SKIP_SIDE_LINE}`}
            />
          ) : (
            <ListingSkipEmpty listingId={sheet.listingId} />
          )}

          <SkipForm listingId={sheet.listingId} isSkip={sheet.isSkip} />

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
