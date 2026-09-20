import Link from "next/link";

import { ListingSkiveEmpty } from "@/components/listing-skive-empty";
import { SyncSkive } from "@/components/listing-skive-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  SKIVE_LEAVE_LINE,
  SKIVE_MIRROR_SCRIPT,
  SKIVE_NOTICE_TITLE,
  SKIVE_PAIR_LINE,
  SKIVE_PEEL_LINE,
  SKIVE_REFUSE_COPY,
  SKIVE_STAYS_LINE,
  SKIVE_STILL_LINE,
  SKIVE_TABLE_LINE,
  SKIVE_TOTE_LINE,
  SKIVE_WALK_LINE,
} from "@/lib/listing-skive";
import { listingPath, listingSkiveWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type SkiveViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type SkiveViewSheet = {
  kind: SkiveViewKind;
  listingId: string;
  isSkive: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function SkiveMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={SKIVE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function SkiveRefused({ sheet }: { sheet: SkiveViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-skive-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={SKIVE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A skive note is for a pair on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {SKIVE_TABLE_LINE} {SKIVE_PEEL_LINE} {SKIVE_PAIR_LINE} {SKIVE_STILL_LINE}
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

function SkiveForm({
  listingId,
  isSkive,
}: {
  listingId: string;
  isSkive: boolean;
}) {
  return (
    <form
      method="post"
      action={listingSkiveWritePath()}
      className="space-y-3"
      data-skive-form={isSkive ? "open" : "skive"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isSkive ? "open" : "skive"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/skive`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isSkive ? SKIVE_LEAVE_LINE : SKIVE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isSkive
          ? "Clear the tape. Status and the tote stay put."
          : `${SKIVE_STAYS_LINE} ${SKIVE_PEEL_LINE} ${SKIVE_PAIR_LINE} ${SKIVE_STILL_LINE} ${SKIVE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingSkiveView({
  sheet,
  skiveIds,
}: {
  sheet: SkiveViewSheet;
  skiveIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <SkiveMissing />;
  }

  if (sheet.kind !== "physical") {
    return <SkiveRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-skive-sheet="physical"
      data-skive-state={sheet.isSkive ? "skive" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: SKIVE_MIRROR_SCRIPT }} />
      <SyncSkive listingIds={skiveIds} />

      <MallHero>
        <MallCrumb label="I will not skive it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Skive</span>
        </MallCrumb>

        <MallEyebrow>I will not skive it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isSkive ? SKIVE_NOTICE_TITLE : SKIVE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SKIVE_TABLE_LINE} {SKIVE_PEEL_LINE} {SKIVE_PAIR_LINE} {SKIVE_WALK_LINE}{" "}
            {SKIVE_STAYS_LINE} {SKIVE_STILL_LINE} {SKIVE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-skive-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isSkive ? (
              <Badge variant="outline">I will not skive it</Badge>
            ) : (
              <Badge variant="ghost">Skive not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Skive paper
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
            {sheet.isSkive
              ? "Still for sale. Seller taped the skive note. Status stays available. Not a cobbler."
              : "Still peeling. Still a pair. Tape it when walkers still want the peel skived."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isSkive ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not skive it"
              title={SKIVE_NOTICE_TITLE}
              body={`${SKIVE_STILL_LINE} avail=open still lists this pair.`}
            />
          ) : (
            <ListingSkiveEmpty listingId={sheet.listingId} />
          )}

          <SkiveForm listingId={sheet.listingId} isSkive={sheet.isSkive} />

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
