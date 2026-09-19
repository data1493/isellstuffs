import Link from "next/link";

import { ListingCinchEmpty } from "@/components/listing-cinch-empty";
import { SyncCinch } from "@/components/listing-cinch-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  CINCH_LEAVE_LINE,
  CINCH_MIRROR_SCRIPT,
  CINCH_NOTICE_TITLE,
  CINCH_PITS_LINE,
  CINCH_REFUSE_COPY,
  CINCH_SIZE_LINE,
  CINCH_STAYS_LINE,
  CINCH_STILL_LINE,
  CINCH_TABLE_LINE,
  CINCH_TOTE_LINE,
  CINCH_WALK_LINE,
} from "@/lib/listing-cinch";
import { listingCinchWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type CinchViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "owned";

export type CinchViewSheet = {
  kind: CinchViewKind;
  listingId: string;
  isCinch: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function CinchMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={CINCH_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function CinchRefused({ sheet }: { sheet: CinchViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const owned = sheet.kind === "owned";

  return (
    <div data-cinch-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : owned
                ? "Another note already owns that one"
                : "Walked"
        }
        title={CINCH_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A cinch note is for the windbreaker on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {CINCH_TABLE_LINE} {CINCH_PITS_LINE} {CINCH_SIZE_LINE} {CINCH_STILL_LINE}
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

function CinchForm({
  listingId,
  isCinch,
}: {
  listingId: string;
  isCinch: boolean;
}) {
  return (
    <form
      method="post"
      action={listingCinchWritePath()}
      className="space-y-3"
      data-cinch-form={isCinch ? "open" : "cinch"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isCinch ? "open" : "cinch"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/cinch`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isCinch ? CINCH_LEAVE_LINE : CINCH_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isCinch
          ? "Clear the tape. Status and the tote stay put."
          : `${CINCH_STAYS_LINE} ${CINCH_PITS_LINE} ${CINCH_SIZE_LINE} ${CINCH_STILL_LINE} ${CINCH_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingCinchView({
  sheet,
  cinchIds,
}: {
  sheet: CinchViewSheet;
  cinchIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <CinchMissing />;
  }

  if (sheet.kind !== "physical") {
    return <CinchRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-cinch-sheet="physical"
      data-cinch-state={sheet.isCinch ? "cinch" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: CINCH_MIRROR_SCRIPT }} />
      <SyncCinch listingIds={cinchIds} />

      <MallHero>
        <MallCrumb label="I will not cinch it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Cinch</span>
        </MallCrumb>

        <MallEyebrow>I will not cinch it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isCinch ? CINCH_NOTICE_TITLE : CINCH_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {CINCH_TABLE_LINE} {CINCH_PITS_LINE} {CINCH_SIZE_LINE} {CINCH_WALK_LINE}{" "}
            {CINCH_STAYS_LINE} {CINCH_STILL_LINE} {CINCH_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-cinch-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isCinch ? (
              <Badge variant="outline">I will not cinch it</Badge>
            ) : (
              <Badge variant="ghost">Cinch not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Cinch paper
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
            {sheet.isCinch
              ? "Still for sale. Seller taped the cinch note. Status stays available. Not a tailor."
              : "Still pits. Still a hopeful L. Tape it when walkers still want the waist cinched."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isCinch ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not cinch it"
              title={CINCH_NOTICE_TITLE}
              body={`${CINCH_STILL_LINE} avail=open still lists this jacket.`}
            />
          ) : (
            <ListingCinchEmpty listingId={sheet.listingId} />
          )}

          <CinchForm listingId={sheet.listingId} isCinch={sheet.isCinch} />

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
