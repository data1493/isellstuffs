import Link from "next/link";

import { ListingDartEmpty } from "@/components/listing-dart-empty";
import { SyncDart } from "@/components/listing-dart-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  DART_CAR_LINE,
  DART_LEAVE_LINE,
  DART_MIRROR_SCRIPT,
  DART_NOTICE_TITLE,
  DART_REFUSE_COPY,
  DART_STAYS_LINE,
  DART_STILL_LINE,
  DART_TABLE_LINE,
  DART_TOTE_LINE,
  DART_WALK_LINE,
  DART_WORN_LINE,
} from "@/lib/listing-dart";
import { listingDartWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type DartViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "sneakers"
  | "lamp"
  | "owned";

export type DartViewSheet = {
  kind: DartViewKind;
  listingId: string;
  isDart: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function DartMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={DART_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function DartRefused({ sheet }: { sheet: DartViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const sneakers = sheet.kind === "sneakers";
  const lamp = sheet.kind === "lamp";
  const owned = sheet.kind === "owned";

  return (
    <div data-dart-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : sneakers
                ? "Sneakers stay on stitch"
                : lamp
                  ? "A lamp is not a jacket"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={DART_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A dart note is for the windbreaker on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {DART_TABLE_LINE} {DART_WORN_LINE} {DART_CAR_LINE} {DART_STILL_LINE}
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

function DartForm({
  listingId,
  isDart,
}: {
  listingId: string;
  isDart: boolean;
}) {
  return (
    <form
      method="post"
      action={listingDartWritePath()}
      className="space-y-3"
      data-dart-form={isDart ? "open" : "dart"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isDart ? "open" : "dart"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/dart`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isDart ? DART_LEAVE_LINE : DART_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isDart
          ? "Clear the tape. Status and the tote stay put."
          : `${DART_STAYS_LINE} ${DART_WORN_LINE} ${DART_CAR_LINE} ${DART_STILL_LINE} ${DART_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingDartView({
  sheet,
  dartIds,
}: {
  sheet: DartViewSheet;
  dartIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <DartMissing />;
  }

  if (sheet.kind !== "physical") {
    return <DartRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-dart-sheet="physical"
      data-dart-state={sheet.isDart ? "dart" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: DART_MIRROR_SCRIPT }} />
      <SyncDart listingIds={dartIds} />

      <MallHero>
        <MallCrumb label="I will not dart it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Dart</span>
        </MallCrumb>

        <MallEyebrow>I will not dart it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isDart ? DART_NOTICE_TITLE : DART_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {DART_TABLE_LINE} {DART_WORN_LINE} {DART_CAR_LINE} {DART_WALK_LINE}{" "}
            {DART_STAYS_LINE} {DART_STILL_LINE} {DART_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-dart-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isDart ? (
              <Badge variant="outline">I will not dart it</Badge>
            ) : (
              <Badge variant="ghost">Dart not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Dart paper
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
            {sheet.isDart
              ? "Still for sale. Seller taped the dart note. Status stays available. Not a tailor."
              : "Still worn twice. Still a car. Tape it when walkers still want the sides taken in."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isDart ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not dart it"
              title={DART_NOTICE_TITLE}
              body={`${DART_STILL_LINE} avail=open still lists this jacket.`}
            />
          ) : (
            <ListingDartEmpty listingId={sheet.listingId} />
          )}

          <DartForm listingId={sheet.listingId} isDart={sheet.isDart} />

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
