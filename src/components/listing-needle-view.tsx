import Link from "next/link";

import { ListingNeedleEmpty } from "@/components/listing-needle-empty";
import { SyncNeedle } from "@/components/listing-needle-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  NEEDLE_MIRROR_SCRIPT,
  NEEDLE_PARTS_LINE,
  NEEDLE_REFUSE_COPY,
  NEEDLE_SKIP_LINE,
  NEEDLE_STILL_LINE,
  NEEDLE_STYLUS_LINE,
  NEEDLE_TABLE_LINE,
  NEEDLE_TOTE_LINE,
} from "@/lib/listing-needle";
import { listingNeedleWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type NeedleViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type NeedleViewSheet = {
  kind: NeedleViewKind;
  listingId: string;
  isNeedle: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function NeedleMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={NEEDLE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function NeedleRefused({ sheet }: { sheet: NeedleViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-needle-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={NEEDLE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Needle honesty is for a player on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {NEEDLE_TABLE_LINE} {NEEDLE_STYLUS_LINE} {NEEDLE_STILL_LINE}
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

function NeedleForm({
  listingId,
  isNeedle,
}: {
  listingId: string;
  isNeedle: boolean;
}) {
  return (
    <form
      method="post"
      action={listingNeedleWritePath()}
      className="space-y-3"
      data-needle-form={isNeedle ? "open" : "needle"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isNeedle ? "open" : "needle"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/needle`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isNeedle ? "Stylus is in" : "The needle walked"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isNeedle
          ? "Clear the tape. Status and the tote stay put."
          : `${NEEDLE_STYLUS_LINE} ${NEEDLE_STILL_LINE} ${NEEDLE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingNeedleView({
  sheet,
  needleIds,
}: {
  sheet: NeedleViewSheet;
  needleIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <NeedleMissing />;
  }

  if (sheet.kind !== "physical") {
    return <NeedleRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-needle-sheet="physical"
      data-needle-state={sheet.isNeedle ? "needle" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: NEEDLE_MIRROR_SCRIPT }} />
      <SyncNeedle listingIds={needleIds} />

      <MallHero>
        <MallCrumb label="The needle walked">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Needle</span>
        </MallCrumb>

        <MallEyebrow>Needle honesty</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isNeedle ? NEEDLE_TABLE_LINE : "The needle walked."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {NEEDLE_TABLE_LINE} {NEEDLE_STYLUS_LINE} {NEEDLE_STILL_LINE}{" "}
            {NEEDLE_TOTE_LINE} {NEEDLE_SKIP_LINE} {NEEDLE_PARTS_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-needle-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isNeedle ? (
              <Badge variant="outline">The needle walked</Badge>
            ) : (
              <Badge variant="ghost">Stylus is in</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Needle tag
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
            {sheet.isNeedle
              ? "Still for sale. Seller taped the needle. Status stays available. Not a fourth status."
              : "Skip is the chorus. Tape the needle when the stylus walked off the player."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isNeedle ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="The needle walked"
              title={NEEDLE_TABLE_LINE}
              body={`${NEEDLE_STYLUS_LINE} ${NEEDLE_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingNeedleEmpty listingId={sheet.listingId} />
          )}

          <NeedleForm listingId={sheet.listingId} isNeedle={sheet.isNeedle} />

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
