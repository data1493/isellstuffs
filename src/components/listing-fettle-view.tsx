import Link from "next/link";

import { ListingFettleEmpty } from "@/components/listing-fettle-empty";
import { SyncFettle } from "@/components/listing-fettle-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  FETTLE_CHIP_LINE,
  FETTLE_LEAVE_LINE,
  FETTLE_MIRROR_SCRIPT,
  FETTLE_MUG_LINE,
  FETTLE_NOTICE_TITLE,
  FETTLE_REFUSE_COPY,
  FETTLE_STAYS_LINE,
  FETTLE_STILL_LINE,
  FETTLE_TABLE_LINE,
  FETTLE_TOTE_LINE,
  FETTLE_WALK_LINE,
} from "@/lib/listing-fettle";
import { listingFettleWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type FettleViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "lid"
  | "whisk"
  | "chair"
  | "owned";

export type FettleViewSheet = {
  kind: FettleViewKind;
  listingId: string;
  isFettle: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function FettleMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={FETTLE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function FettleRefused({ sheet }: { sheet: FettleViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const lid = sheet.kind === "lid";
  const whisk = sheet.kind === "whisk";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-fettle-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : lid
                ? "A lid is not a mug"
                : whisk
                  ? "A whisk is not a mug"
                  : chair
                    ? "A chair is not a mug"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={FETTLE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A fettle note is for the diner mug on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {FETTLE_TABLE_LINE} {FETTLE_CHIP_LINE} {FETTLE_MUG_LINE}{" "}
              {FETTLE_STILL_LINE}
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

function FettleForm({
  listingId,
  isFettle,
}: {
  listingId: string;
  isFettle: boolean;
}) {
  return (
    <form
      method="post"
      action={listingFettleWritePath()}
      className="space-y-3"
      data-fettle-form={isFettle ? "open" : "fettle"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isFettle ? "open" : "fettle"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/fettle`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isFettle ? FETTLE_LEAVE_LINE : FETTLE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isFettle
          ? "Clear the tape. Status and the tote stay put."
          : `${FETTLE_STAYS_LINE} ${FETTLE_CHIP_LINE} ${FETTLE_MUG_LINE} ${FETTLE_STILL_LINE} ${FETTLE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingFettleView({
  sheet,
  fettleIds,
}: {
  sheet: FettleViewSheet;
  fettleIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <FettleMissing />;
  }

  if (sheet.kind !== "physical") {
    return <FettleRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-fettle-sheet="physical"
      data-fettle-state={sheet.isFettle ? "fettle" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: FETTLE_MIRROR_SCRIPT }} />
      <SyncFettle listingIds={fettleIds} />

      <MallHero>
        <MallCrumb label="I will not fettle it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Fettle</span>
        </MallCrumb>

        <MallEyebrow>I will not fettle it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isFettle ? FETTLE_NOTICE_TITLE : FETTLE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {FETTLE_TABLE_LINE} {FETTLE_CHIP_LINE} {FETTLE_MUG_LINE}{" "}
            {FETTLE_WALK_LINE} {FETTLE_STAYS_LINE} {FETTLE_STILL_LINE}{" "}
            {FETTLE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-fettle-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isFettle ? (
              <Badge variant="outline">I will not fettle it</Badge>
            ) : (
              <Badge variant="ghost">Fettle not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Fettle paper
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
            {sheet.isFettle
              ? "Still for sale. Seller taped the fettle note. Status stays available. Not a kiln."
              : "Still a chip. Still a mug. Tape it when walkers still want the rim dressed."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isFettle ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not fettle it"
              title={FETTLE_NOTICE_TITLE}
              body={`${FETTLE_STILL_LINE} avail=open still lists this mug.`}
            />
          ) : (
            <ListingFettleEmpty listingId={sheet.listingId} />
          )}

          <FettleForm listingId={sheet.listingId} isFettle={sheet.isFettle} />

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
