import Link from "next/link";

import { ListingRingEmpty } from "@/components/listing-ring-empty";
import { SyncRing } from "@/components/listing-ring-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  RING_FURNITURE_LINE,
  RING_HEAT_LINE,
  RING_MIRROR_SCRIPT,
  RING_REFUSE_COPY,
  RING_STILL_LINE,
  RING_TABLE_LINE,
  RING_TOTE_LINE,
} from "@/lib/listing-ring";
import { listingPath, listingRingWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type RingViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type RingViewSheet = {
  kind: RingViewKind;
  listingId: string;
  isRing: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function RingMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={RING_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function RingRefused({ sheet }: { sheet: RingViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-ring-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={RING_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "The water ring stays is for furniture on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {RING_TABLE_LINE} {RING_FURNITURE_LINE} {RING_HEAT_LINE}{" "}
              {RING_STILL_LINE}
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

function RingForm({
  listingId,
  isRing,
}: {
  listingId: string;
  isRing: boolean;
}) {
  return (
    <form
      method="post"
      action={listingRingWritePath()}
      className="space-y-3"
      data-ring-form={isRing ? "open" : "ring"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isRing ? "open" : "ring"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/ring`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isRing ? "The ring can leave" : "The water ring stays"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isRing
          ? "Clear the tape. Status and the tote stay put."
          : `${RING_FURNITURE_LINE} ${RING_HEAT_LINE} ${RING_STILL_LINE} ${RING_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingRingView({
  sheet,
  ringIds,
}: {
  sheet: RingViewSheet;
  ringIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <RingMissing />;
  }

  if (sheet.kind !== "physical") {
    return <RingRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-ring-sheet="physical"
      data-ring-state={sheet.isRing ? "ring" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: RING_MIRROR_SCRIPT }} />
      <SyncRing listingIds={ringIds} />

      <MallHero>
        <MallCrumb label="The water ring stays">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Ring</span>
        </MallCrumb>

        <MallEyebrow>Water ring</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isRing ? RING_TABLE_LINE : "The water ring stays."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {RING_TABLE_LINE} {RING_FURNITURE_LINE} {RING_HEAT_LINE}{" "}
            {RING_STILL_LINE} {RING_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-ring-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isRing ? (
              <Badge variant="outline">The water ring stays</Badge>
            ) : (
              <Badge variant="ghost">No ring tape</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Ring tape
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
            {sheet.isRing
              ? "Still for sale. Seller taped the furniture ring. Walkers still bag it. Status stays available."
              : "Heat is the mug. Wrap is newspaper. Tape the ring when the furniture already has one."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isRing ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="The water ring stays"
              title={RING_TABLE_LINE}
              body={`${RING_FURNITURE_LINE} ${RING_STILL_LINE} avail=open still lists this pile. ${RING_HEAT_LINE}`}
            />
          ) : (
            <ListingRingEmpty listingId={sheet.listingId} />
          )}

          <RingForm listingId={sheet.listingId} isRing={sheet.isRing} />

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
