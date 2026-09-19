import Link from "next/link";

import { ListingHeatEmpty } from "@/components/listing-heat-empty";
import { SyncHeat } from "@/components/listing-heat-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  HEAT_CERAMIC_LINE,
  HEAT_MIRROR_SCRIPT,
  HEAT_REFUSE_COPY,
  HEAT_RIM_LINE,
  HEAT_STILL_LINE,
  HEAT_TABLE_LINE,
  HEAT_TOTE_LINE,
  HEAT_WRAP_LINE,
} from "@/lib/listing-heat";
import { listingHeatWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type HeatViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type HeatViewSheet = {
  kind: HeatViewKind;
  listingId: string;
  isHeat: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function HeatMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={HEAT_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function HeatRefused({ sheet }: { sheet: HeatViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-heat-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={HEAT_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Heat tape is for ceramic on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {HEAT_TABLE_LINE} {HEAT_CERAMIC_LINE} {HEAT_RIM_LINE}{" "}
              {HEAT_STILL_LINE}
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

function HeatForm({
  listingId,
  isHeat,
}: {
  listingId: string;
  isHeat: boolean;
}) {
  return (
    <form
      method="post"
      action={listingHeatWritePath()}
      className="space-y-3"
      data-heat-form={isHeat ? "open" : "heat"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isHeat ? "open" : "heat"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/heat`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isHeat ? "It can go in" : "Not for the microwave"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isHeat
          ? "Clear the tape. Status and the tote stay put."
          : `${HEAT_CERAMIC_LINE} ${HEAT_RIM_LINE} ${HEAT_STILL_LINE} ${HEAT_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingHeatView({
  sheet,
  heatIds,
}: {
  sheet: HeatViewSheet;
  heatIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <HeatMissing />;
  }

  if (sheet.kind !== "physical") {
    return <HeatRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-heat-sheet="physical"
      data-heat-state={sheet.isHeat ? "heat" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: HEAT_MIRROR_SCRIPT }} />
      <SyncHeat listingIds={heatIds} />

      <MallHero>
        <MallCrumb label="Not for the microwave">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Heat</span>
        </MallCrumb>

        <MallEyebrow>Microwave</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isHeat ? HEAT_TABLE_LINE : "Not for the microwave."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {HEAT_TABLE_LINE} {HEAT_CERAMIC_LINE} {HEAT_RIM_LINE} {HEAT_WRAP_LINE}{" "}
            {HEAT_STILL_LINE} {HEAT_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-heat-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isHeat ? (
              <Badge variant="outline">Not for the microwave</Badge>
            ) : (
              <Badge variant="ghost">No heat tape</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Microwave
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
            {sheet.isHeat
              ? "Still for sale. Seller taped the gold rim. Walkers still bag it. Status stays available."
              : "Wrap is newspaper. Fits is a lid. Tape heat when the ceramic cannot go in."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isHeat ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Not for the microwave"
              title={HEAT_TABLE_LINE}
              body={`${HEAT_STILL_LINE} avail=open still lists this pile. ${HEAT_RIM_LINE}`}
            />
          ) : (
            <ListingHeatEmpty listingId={sheet.listingId} />
          )}

          <HeatForm listingId={sheet.listingId} isHeat={sheet.isHeat} />

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
