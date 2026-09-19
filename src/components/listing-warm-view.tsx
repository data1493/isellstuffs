import Link from "next/link";

import { ListingWarmEmpty } from "@/components/listing-warm-empty";
import { SyncWarm } from "@/components/listing-warm-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  WARM_CONVERT_LINE,
  WARM_LOOKS_LINE,
  WARM_MIRROR_SCRIPT,
  WARM_NOTICE_TITLE,
  WARM_REFUSE_COPY,
  WARM_SHOT_LINE,
  WARM_STILL_LINE,
  WARM_TOTE_LINE,
  WARM_WALK_LINE,
} from "@/lib/listing-warm";
import { listingPath, listingWarmWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type WarmViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type WarmViewSheet = {
  kind: WarmViewKind;
  listingId: string;
  isWarm: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function WarmMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={WARM_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function WarmRefused({ sheet }: { sheet: WarmViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-warm-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={WARM_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Warm stays warm is for a file on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {WARM_NOTICE_TITLE} {WARM_SHOT_LINE} {WARM_CONVERT_LINE}{" "}
              {WARM_WALK_LINE} {WARM_STILL_LINE}
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
    </div>
  );
}

function WarmForm({
  listingId,
  isWarm,
}: {
  listingId: string;
  isWarm: boolean;
}) {
  return (
    <form
      method="post"
      action={listingWarmWritePath()}
      className="space-y-3"
      data-warm-form={isWarm ? "open" : "warm"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isWarm ? "open" : "warm"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/warm`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isWarm ? "Leave the three looks" : "Warm stays warm"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isWarm
          ? "Clear the warm paper. Status and the tote stay put."
          : `${WARM_LOOKS_LINE} ${WARM_SHOT_LINE} ${WARM_CONVERT_LINE} ${WARM_WALK_LINE} ${WARM_STILL_LINE} ${WARM_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingWarmView({
  sheet,
  warmIds,
}: {
  sheet: WarmViewSheet;
  warmIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <WarmMissing />;
  }

  if (sheet.kind !== "digital") {
    return <WarmRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-warm-sheet="digital"
      data-warm-state={sheet.isWarm ? "warm" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: WARM_MIRROR_SCRIPT }} />
      <SyncWarm listingIds={warmIds} />

      <MallHero>
        <MallCrumb label="Warm stays warm">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Warm</span>
        </MallCrumb>

        <MallEyebrow>Warm stays warm</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isWarm ? WARM_NOTICE_TITLE : "Warm stays warm."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {WARM_NOTICE_TITLE} {WARM_SHOT_LINE} {WARM_CONVERT_LINE}{" "}
            {WARM_WALK_LINE} {WARM_STILL_LINE} {WARM_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-warm-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isWarm ? (
              <Badge variant="outline">Three looks</Badge>
            ) : (
              <Badge variant="ghost">Open to warm</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Warm paper
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
            {sheet.isWarm
              ? "Still for sale. Seller taped that the warm stays warm. Walkers still ask Half-Working for a fourth look. Status stays available."
              : "Three looks. Tape it when walkers still want a night look, or four."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isWarm ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Warm stays warm"
              title={WARM_NOTICE_TITLE}
              body={`${WARM_STILL_LINE} avail=open still lists this file. ${WARM_LOOKS_LINE}`}
            />
          ) : (
            <ListingWarmEmpty listingId={sheet.listingId} />
          )}

          <WarmForm listingId={sheet.listingId} isWarm={sheet.isWarm} />

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
