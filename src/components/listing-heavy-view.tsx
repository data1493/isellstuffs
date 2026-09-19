import Link from "next/link";

import { SyncHeavy } from "@/components/listing-heavy-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  HEAVY_EMPTY_LINE,
  HEAVY_LIFT_LINE,
  HEAVY_MIRROR_SCRIPT,
  HEAVY_PICKUP_LINE,
  HEAVY_REFUSE_COPY,
  HEAVY_STILL_LINE,
  HEAVY_TABLE_LINE,
  HEAVY_TOTE_LINE,
} from "@/lib/listing-heavy";
import { listingHeavyWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type HeavyViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type HeavyViewSheet = {
  kind: HeavyViewKind;
  listingId: string;
  isHeavy: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function HeavyMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={HEAVY_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function HeavyRefused({ sheet }: { sheet: HeavyViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <MallNotice
      tone="empty"
      eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
      title={HEAVY_REFUSE_COPY}
      body={
        <div className="space-y-2" data-heavy-sheet={sheet.kind}>
          <p>
            {sheet.fact ? (
              <>
                <span className="font-medium text-foreground">{sheet.fact}</span>
                {sheet.stallName ? <> · {sheet.stallName}</> : null}
              </>
            ) : (
              "Weight paper is for a thing you lift, not a PDF and not a gift code."
            )}
          </p>
          <p>
            {HEAVY_TABLE_LINE} {HEAVY_STILL_LINE}
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
  );
}

function HeavyForm({
  listingId,
  isHeavy,
}: {
  listingId: string;
  isHeavy: boolean;
}) {
  return (
    <form
      method="post"
      action={listingHeavyWritePath()}
      className="space-y-3"
      data-heavy-form={isHeavy ? "one" : "heavy"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isHeavy ? "one" : "heavy"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/heavy`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isHeavy ? "One person can lift" : "Needs two people"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isHeavy
          ? "Clear the lift. Status and the tote stay put."
          : `${HEAVY_STILL_LINE} ${HEAVY_TOTE_LINE} ${HEAVY_LIFT_LINE}`}
      </p>
    </form>
  );
}

export function ListingHeavyView({
  sheet,
  heavyIds,
}: {
  sheet: HeavyViewSheet;
  heavyIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <HeavyMissing />;
  }

  if (sheet.kind !== "physical") {
    return <HeavyRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-heavy-sheet="physical"
      data-heavy-state={sheet.isHeavy ? "heavy" : "empty"}
    >
      <script dangerouslySetInnerHTML={{ __html: HEAVY_MIRROR_SCRIPT }} />
      <SyncHeavy listingIds={heavyIds} />

      <MallHero>
        <MallCrumb label="Needs two people">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Heavy</span>
        </MallCrumb>

        <MallEyebrow>Weight paper</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isHeavy ? HEAVY_TABLE_LINE : "Needs two people."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {HEAVY_TABLE_LINE} {HEAVY_STILL_LINE} {HEAVY_TOTE_LINE}{" "}
            {HEAVY_LIFT_LINE} {HEAVY_PICKUP_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-heavy-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isHeavy ? (
              <Badge variant="outline">Two people</Badge>
            ) : (
              <Badge variant="ghost">One person can lift</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Weight tag
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
            {sheet.isHeavy
              ? "Still for sale. Bring a friend for the lift. Status stays available."
              : "The ceramic is heavier than it looks. Tape the lift when one pair of hands is not enough."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isHeavy ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Two people"
              title={HEAVY_TABLE_LINE}
              body={`${HEAVY_STILL_LINE} ${HEAVY_TOTE_LINE} ${HEAVY_PICKUP_LINE}`}
            />
          ) : (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="One person can lift"
              title={HEAVY_EMPTY_LINE}
              body="Tape a lift when the pile needs a friend. It does not drop the tote or mark it sold."
            />
          )}

          <HeavyForm listingId={sheet.listingId} isHeavy={sheet.isHeavy} />

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
