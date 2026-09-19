import Link from "next/link";

import { ListingStitchEmpty } from "@/components/listing-stitch-empty";
import { SyncStitch } from "@/components/listing-stitch-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  STITCH_LEAVE_LINE,
  STITCH_MIRROR_SCRIPT,
  STITCH_NOTICE_TITLE,
  STITCH_PAIR_LINE,
  STITCH_PEEL_LINE,
  STITCH_REFUSE_COPY,
  STITCH_STAYS_LINE,
  STITCH_STILL_LINE,
  STITCH_TABLE_LINE,
  STITCH_TOTE_LINE,
  STITCH_WALK_LINE,
} from "@/lib/listing-stitch";
import { listingPath, listingStitchWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type StitchViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type StitchViewSheet = {
  kind: StitchViewKind;
  listingId: string;
  isStitch: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function StitchMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={STITCH_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function StitchRefused({ sheet }: { sheet: StitchViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-stitch-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={STITCH_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A stitch note is for a pair on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {STITCH_TABLE_LINE} {STITCH_PAIR_LINE} {STITCH_PEEL_LINE} {STITCH_STILL_LINE}
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

function StitchForm({
  listingId,
  isStitch,
}: {
  listingId: string;
  isStitch: boolean;
}) {
  return (
    <form
      method="post"
      action={listingStitchWritePath()}
      className="space-y-3"
      data-stitch-form={isStitch ? "open" : "stitch"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isStitch ? "open" : "stitch"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/stitch`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isStitch ? STITCH_LEAVE_LINE : STITCH_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isStitch
          ? "Clear the tape. Status and the tote stay put."
          : `${STITCH_STAYS_LINE} ${STITCH_PAIR_LINE} ${STITCH_PEEL_LINE} ${STITCH_STILL_LINE} ${STITCH_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingStitchView({
  sheet,
  stitchIds,
}: {
  sheet: StitchViewSheet;
  stitchIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <StitchMissing />;
  }

  if (sheet.kind !== "physical") {
    return <StitchRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-stitch-sheet="physical"
      data-stitch-state={sheet.isStitch ? "stitch" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: STITCH_MIRROR_SCRIPT }} />
      <SyncStitch listingIds={stitchIds} />

      <MallHero>
        <MallCrumb label="I will not stitch them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Stitch</span>
        </MallCrumb>

        <MallEyebrow>I will not stitch them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isStitch ? STITCH_NOTICE_TITLE : STITCH_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {STITCH_TABLE_LINE} {STITCH_PAIR_LINE} {STITCH_PEEL_LINE} {STITCH_WALK_LINE}{" "}
            {STITCH_STAYS_LINE} {STITCH_STILL_LINE} {STITCH_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-stitch-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isStitch ? (
              <Badge variant="outline">I will not stitch them</Badge>
            ) : (
              <Badge variant="ghost">Stitch not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Stitch paper
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
            {sheet.isStitch
              ? "Still for sale. Seller taped the stitch note. Status stays available. Not a cobbler."
              : "Still a pair. Still peeling. Tape it when walkers still want the pair stitched."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isStitch ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not stitch them"
              title={STITCH_NOTICE_TITLE}
              body={`${STITCH_STILL_LINE} avail=open still lists this pair.`}
            />
          ) : (
            <ListingStitchEmpty listingId={sheet.listingId} />
          )}

          <StitchForm listingId={sheet.listingId} isStitch={sheet.isStitch} />

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
