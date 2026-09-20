import Link from "next/link";

import { ListingMistrackEmpty } from "@/components/listing-mistrack-empty";
import { SyncMistrack } from "@/components/listing-mistrack-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  MISTRACK_LEAVE_LINE,
  MISTRACK_MIRROR_SCRIPT,
  MISTRACK_NOTICE_TITLE,
  MISTRACK_REFUSE_COPY,
  MISTRACK_SKIP_LINE,
  MISTRACK_STAYS_LINE,
  MISTRACK_STILL_LINE,
  MISTRACK_TABLE_LINE,
  MISTRACK_TOTE_LINE,
  MISTRACK_UNNAMED_LINE,
  MISTRACK_WALK_LINE,
} from "@/lib/listing-mistrack";
import { listingPath, listingMistrackWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type MistrackViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

export type MistrackViewSheet = {
  kind: MistrackViewKind;
  listingId: string;
  isMistrack: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function MistrackMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={MISTRACK_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function MistrackRefused({ sheet }: { sheet: MistrackViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const mixtape = sheet.kind === "mixtape";
  const jewels = sheet.kind === "jewels";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-mistrack-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : mixtape
                ? "A mixtape is not an LP"
                : jewels
                  ? "Empty jewels are not an LP"
                  : chair
                    ? "A chair is not an LP"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={MISTRACK_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A mistrack note is for the unnamed LP on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {MISTRACK_TABLE_LINE} {MISTRACK_SKIP_LINE} {MISTRACK_UNNAMED_LINE}{" "}
              {MISTRACK_STILL_LINE}
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

function MistrackForm({
  listingId,
  isMistrack,
}: {
  listingId: string;
  isMistrack: boolean;
}) {
  return (
    <form
      method="post"
      action={listingMistrackWritePath()}
      className="space-y-3"
      data-mistrack-form={isMistrack ? "open" : "mistrack"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isMistrack ? "open" : "mistrack"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/mistrack`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isMistrack ? MISTRACK_LEAVE_LINE : MISTRACK_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isMistrack
          ? "Clear the tape. Status and the tote stay put."
          : `${MISTRACK_STAYS_LINE} ${MISTRACK_SKIP_LINE} ${MISTRACK_UNNAMED_LINE} ${MISTRACK_STILL_LINE} ${MISTRACK_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingMistrackView({
  sheet,
  mistrackIds,
}: {
  sheet: MistrackViewSheet;
  mistrackIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <MistrackMissing />;
  }

  if (sheet.kind !== "physical") {
    return <MistrackRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-mistrack-sheet="physical"
      data-mistrack-state={sheet.isMistrack ? "mistrack" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: MISTRACK_MIRROR_SCRIPT }} />
      <SyncMistrack listingIds={mistrackIds} />

      <MallHero>
        <MallCrumb label="I will not mistrack it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Mistrack</span>
        </MallCrumb>

        <MallEyebrow>I will not mistrack it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isMistrack ? MISTRACK_NOTICE_TITLE : MISTRACK_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {MISTRACK_TABLE_LINE} {MISTRACK_SKIP_LINE} {MISTRACK_UNNAMED_LINE}{" "}
            {MISTRACK_WALK_LINE} {MISTRACK_STAYS_LINE} {MISTRACK_STILL_LINE}{" "}
            {MISTRACK_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-mistrack-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isMistrack ? (
              <Badge variant="outline">I will not mistrack it</Badge>
            ) : (
              <Badge variant="ghost">Mistrack not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Mistrack paper
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
            {sheet.isMistrack
              ? "Still for sale. Seller taped the mistrack note. Status stays available. Not a shop rake."
              : "Still a skip. Still unnamed. Tape it when walkers still want a shop mistrack."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isMistrack ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not mistrack it"
              title={MISTRACK_NOTICE_TITLE}
              body={`${MISTRACK_STILL_LINE} avail=open still lists this LP.`}
            />
          ) : (
            <ListingMistrackEmpty listingId={sheet.listingId} />
          )}

          <MistrackForm listingId={sheet.listingId} isMistrack={sheet.isMistrack} />

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
