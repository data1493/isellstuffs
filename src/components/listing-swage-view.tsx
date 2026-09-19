import Link from "next/link";

import { ListingSwageEmpty } from "@/components/listing-swage-empty";
import { SyncSwage } from "@/components/listing-swage-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  SWAGE_LEAVE_LINE,
  SWAGE_LIGHTS_LINE,
  SWAGE_MIRROR_SCRIPT,
  SWAGE_NOTICE_TITLE,
  SWAGE_REFUSE_COPY,
  SWAGE_STAYS_LINE,
  SWAGE_STILL_LINE,
  SWAGE_TABLE_LINE,
  SWAGE_TOTE_LINE,
  SWAGE_WALK_LINE,
  SWAGE_WOBBLE_LINE,
} from "@/lib/listing-swage";
import { listingPath, listingSwageWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type SwageViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "chair"
  | "lid"
  | "owned";

export type SwageViewSheet = {
  kind: SwageViewKind;
  listingId: string;
  isSwage: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function SwageMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={SWAGE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function SwageRefused({ sheet }: { sheet: SwageViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const chair = sheet.kind === "chair";
  const lid = sheet.kind === "lid";
  const owned = sheet.kind === "owned";

  return (
    <div data-swage-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : chair
                ? "A chair is not a neck"
                : lid
                  ? "A lid is not a neck"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={SWAGE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A swage note is for the wobbly lamp on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {SWAGE_TABLE_LINE} {SWAGE_WOBBLE_LINE} {SWAGE_LIGHTS_LINE}{" "}
              {SWAGE_STILL_LINE}
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

function SwageForm({
  listingId,
  isSwage,
}: {
  listingId: string;
  isSwage: boolean;
}) {
  return (
    <form
      method="post"
      action={listingSwageWritePath()}
      className="space-y-3"
      data-swage-form={isSwage ? "open" : "swage"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isSwage ? "open" : "swage"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/swage`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isSwage ? SWAGE_LEAVE_LINE : SWAGE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isSwage
          ? "Clear the tape. Status and the tote stay put."
          : `${SWAGE_STAYS_LINE} ${SWAGE_WOBBLE_LINE} ${SWAGE_LIGHTS_LINE} ${SWAGE_STILL_LINE} ${SWAGE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingSwageView({
  sheet,
  swageIds,
}: {
  sheet: SwageViewSheet;
  swageIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <SwageMissing />;
  }

  if (sheet.kind !== "physical") {
    return <SwageRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-swage-sheet="physical"
      data-swage-state={sheet.isSwage ? "swage" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: SWAGE_MIRROR_SCRIPT }} />
      <SyncSwage listingIds={swageIds} />

      <MallHero>
        <MallCrumb label="I will not swage it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Swage</span>
        </MallCrumb>

        <MallEyebrow>I will not swage it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isSwage ? SWAGE_NOTICE_TITLE : SWAGE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SWAGE_TABLE_LINE} {SWAGE_WOBBLE_LINE} {SWAGE_LIGHTS_LINE}{" "}
            {SWAGE_WALK_LINE} {SWAGE_STAYS_LINE} {SWAGE_STILL_LINE}{" "}
            {SWAGE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-swage-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isSwage ? (
              <Badge variant="outline">I will not swage it</Badge>
            ) : (
              <Badge variant="ghost">Swage not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Swage paper
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
            {sheet.isSwage
              ? "Still for sale. Seller taped the swage note. Status stays available. Not a hardware shop."
              : "Still wobbly. Still lights. Tape it when walkers still want the neck squeezed."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isSwage ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not swage it"
              title={SWAGE_NOTICE_TITLE}
              body={`${SWAGE_STILL_LINE} avail=open still lists this lamp.`}
            />
          ) : (
            <ListingSwageEmpty listingId={sheet.listingId} />
          )}

          <SwageForm listingId={sheet.listingId} isSwage={sheet.isSwage} />

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
