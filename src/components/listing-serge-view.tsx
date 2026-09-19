import Link from "next/link";

import { ListingSergeEmpty } from "@/components/listing-serge-empty";
import { SyncSerge } from "@/components/listing-serge-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  SERGE_CAR_LINE,
  SERGE_LEAVE_LINE,
  SERGE_MIRROR_SCRIPT,
  SERGE_NOTICE_TITLE,
  SERGE_REFUSE_COPY,
  SERGE_STAYS_LINE,
  SERGE_STILL_LINE,
  SERGE_TABLE_LINE,
  SERGE_TOTE_LINE,
  SERGE_WALK_LINE,
  SERGE_WORN_LINE,
} from "@/lib/listing-serge";
import { listingPath, listingSergeWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type SergeViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "sneakers"
  | "lamp"
  | "chair"
  | "owned";

export type SergeViewSheet = {
  kind: SergeViewKind;
  listingId: string;
  isSerge: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function SergeMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={SERGE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function SergeRefused({ sheet }: { sheet: SergeViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const sneakers = sheet.kind === "sneakers";
  const lamp = sheet.kind === "lamp";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-serge-sheet={sheet.kind}>
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
                  : chair
                    ? "A chair is not a jacket"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={SERGE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A serge note is for the windbreaker on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {SERGE_TABLE_LINE} {SERGE_WORN_LINE} {SERGE_CAR_LINE}{" "}
              {SERGE_STILL_LINE}
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

function SergeForm({
  listingId,
  isSerge,
}: {
  listingId: string;
  isSerge: boolean;
}) {
  return (
    <form
      method="post"
      action={listingSergeWritePath()}
      className="space-y-3"
      data-serge-form={isSerge ? "open" : "serge"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isSerge ? "open" : "serge"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/serge`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isSerge ? SERGE_LEAVE_LINE : SERGE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isSerge
          ? "Clear the tape. Status and the tote stay put."
          : `${SERGE_STAYS_LINE} ${SERGE_WORN_LINE} ${SERGE_CAR_LINE} ${SERGE_STILL_LINE} ${SERGE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingSergeView({
  sheet,
  sergeIds,
}: {
  sheet: SergeViewSheet;
  sergeIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <SergeMissing />;
  }

  if (sheet.kind !== "physical") {
    return <SergeRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-serge-sheet="physical"
      data-serge-state={sheet.isSerge ? "serge" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: SERGE_MIRROR_SCRIPT }} />
      <SyncSerge listingIds={sergeIds} />

      <MallHero>
        <MallCrumb label="I will not serge it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Serge</span>
        </MallCrumb>

        <MallEyebrow>I will not serge it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isSerge ? SERGE_NOTICE_TITLE : SERGE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SERGE_TABLE_LINE} {SERGE_WORN_LINE} {SERGE_CAR_LINE}{" "}
            {SERGE_WALK_LINE} {SERGE_STAYS_LINE} {SERGE_STILL_LINE}{" "}
            {SERGE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-serge-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isSerge ? (
              <Badge variant="outline">I will not serge it</Badge>
            ) : (
              <Badge variant="ghost">Serge not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Serge paper
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
            {sheet.isSerge
              ? "Still for sale. Seller taped the serge note. Status stays available. Not a tailor."
              : "Still worn twice. Still a car. Tape it when walkers still want the raw edge overlocked."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isSerge ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not serge it"
              title={SERGE_NOTICE_TITLE}
              body={`${SERGE_STILL_LINE} avail=open still lists this jacket.`}
            />
          ) : (
            <ListingSergeEmpty listingId={sheet.listingId} />
          )}

          <SergeForm listingId={sheet.listingId} isSerge={sheet.isSerge} />

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
