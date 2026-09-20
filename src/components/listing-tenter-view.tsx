import Link from "next/link";

import { ListingTenterEmpty } from "@/components/listing-tenter-empty";
import { SyncTenter } from "@/components/listing-tenter-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  TENTER_GREEN_LINE,
  TENTER_LEAVE_LINE,
  TENTER_MIRROR_SCRIPT,
  TENTER_NOTICE_TITLE,
  TENTER_REFUSE_COPY,
  TENTER_SMELL_LINE,
  TENTER_STAYS_LINE,
  TENTER_STILL_LINE,
  TENTER_TABLE_LINE,
  TENTER_TOTE_LINE,
  TENTER_WALK_LINE,
} from "@/lib/listing-tenter";
import { listingPath, listingTenterWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type TenterViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "soles"
  | "lid"
  | "chair"
  | "owned";

export type TenterViewSheet = {
  kind: TenterViewKind;
  listingId: string;
  isTenter: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function TenterMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={TENTER_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function TenterRefused({ sheet }: { sheet: TenterViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const soles = sheet.kind === "soles";
  const lid = sheet.kind === "lid";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-tenter-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : soles
                ? "Split soles are not a jacket"
                : lid
                  ? "A lid is not a jacket"
                  : chair
                    ? "A chair is not a jacket"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={TENTER_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A tenter note is for the windbreaker on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {TENTER_TABLE_LINE} {TENTER_GREEN_LINE} {TENTER_SMELL_LINE}{" "}
              {TENTER_STILL_LINE}
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

function TenterForm({
  listingId,
  isTenter,
}: {
  listingId: string;
  isTenter: boolean;
}) {
  return (
    <form
      method="post"
      action={listingTenterWritePath()}
      className="space-y-3"
      data-tenter-form={isTenter ? "open" : "tenter"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isTenter ? "open" : "tenter"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/tenter`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isTenter ? TENTER_LEAVE_LINE : TENTER_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isTenter
          ? "Clear the tape. Status and the tote stay put."
          : `${TENTER_STAYS_LINE} ${TENTER_GREEN_LINE} ${TENTER_SMELL_LINE} ${TENTER_STILL_LINE} ${TENTER_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingTenterView({
  sheet,
  tenterIds,
}: {
  sheet: TenterViewSheet;
  tenterIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <TenterMissing />;
  }

  if (sheet.kind !== "physical") {
    return <TenterRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-tenter-sheet="physical"
      data-tenter-state={sheet.isTenter ? "tenter" : "open"}
    >
      <script
        dangerouslySetInnerHTML={{ __html: TENTER_MIRROR_SCRIPT }}
      />
      <SyncTenter listingIds={tenterIds} />

      <MallHero>
        <MallCrumb label="I will not tenter it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Tenter</span>
        </MallCrumb>

        <MallEyebrow>I will not tenter it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isTenter
              ? TENTER_NOTICE_TITLE
              : TENTER_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {TENTER_TABLE_LINE} {TENTER_GREEN_LINE} {TENTER_SMELL_LINE}{" "}
            {TENTER_WALK_LINE} {TENTER_STAYS_LINE} {TENTER_STILL_LINE}{" "}
            {TENTER_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-tenter-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isTenter ? (
              <Badge variant="outline">I will not tenter it</Badge>
            ) : (
              <Badge variant="ghost">Tenter not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Tenter paper
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
            {sheet.isTenter
              ? "Still for sale. Seller taped the tenter note. Status stays available. Not a shop."
              : "Still mint-green. Still smells like a car. Tape it when walkers still want a shop frame."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isTenter ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not tenter it"
              title={TENTER_NOTICE_TITLE}
              body={`${TENTER_STILL_LINE} avail=open still lists this jacket.`}
            />
          ) : (
            <ListingTenterEmpty listingId={sheet.listingId} />
          )}

          <TenterForm
            listingId={sheet.listingId}
            isTenter={sheet.isTenter}
          />

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
