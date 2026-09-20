import Link from "next/link";

import { ListingRasterEmpty } from "@/components/listing-raster-empty";
import { SyncRaster } from "@/components/listing-raster-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  RASTER_BOLD_LINE,
  RASTER_LEAVE_LINE,
  RASTER_MIRROR_SCRIPT,
  RASTER_NOTICE_TITLE,
  RASTER_REFUSE_COPY,
  RASTER_STAYS_LINE,
  RASTER_STILL_LINE,
  RASTER_TABLE_LINE,
  RASTER_TOTE_LINE,
  RASTER_WALK_LINE,
  RASTER_WEIGHTS_LINE,
} from "@/lib/listing-raster";
import { listingPath, listingRasterWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type RasterViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "pack"
  | "lut"
  | "chair"
  | "owned";

export type RasterViewSheet = {
  kind: RasterViewKind;
  listingId: string;
  isRaster: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function RasterMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={RASTER_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function RasterRefused({ sheet }: { sheet: RasterViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const pack = sheet.kind === "pack";
  const lut = sheet.kind === "lut";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-raster-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : pack
              ? "A pack is not a font"
              : lut
                ? "A LUT is not a font"
                : chair
                  ? "A chair is not a font"
                  : owned
                    ? "Another note already owns that one"
                    : object
                      ? "On the table"
                      : "Walked"
        }
        title={RASTER_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A raster note is for the booth font, not a pack and not a gift code."
              )}
            </p>
            <p>
              {RASTER_TABLE_LINE} {RASTER_WEIGHTS_LINE} {RASTER_BOLD_LINE}{" "}
              {RASTER_STILL_LINE}
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

function RasterForm({
  listingId,
  isRaster,
}: {
  listingId: string;
  isRaster: boolean;
}) {
  return (
    <form
      method="post"
      action={listingRasterWritePath()}
      className="space-y-3"
      data-raster-form={isRaster ? "open" : "raster"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isRaster ? "open" : "raster"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/raster`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isRaster ? RASTER_LEAVE_LINE : RASTER_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isRaster
          ? "Clear the tape. Status and the tote stay put."
          : `${RASTER_STAYS_LINE} ${RASTER_WEIGHTS_LINE} ${RASTER_BOLD_LINE} ${RASTER_STILL_LINE} ${RASTER_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingRasterView({
  sheet,
  rasterIds,
}: {
  sheet: RasterViewSheet;
  rasterIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <RasterMissing />;
  }

  if (sheet.kind !== "digital") {
    return <RasterRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-raster-sheet="digital"
      data-raster-state={sheet.isRaster ? "raster" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: RASTER_MIRROR_SCRIPT }} />
      <SyncRaster listingIds={rasterIds} />

      <MallHero>
        <MallCrumb label="I will not raster it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Raster</span>
        </MallCrumb>

        <MallEyebrow>I will not raster it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isRaster ? RASTER_NOTICE_TITLE : RASTER_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {RASTER_TABLE_LINE} {RASTER_WEIGHTS_LINE} {RASTER_BOLD_LINE}{" "}
            {RASTER_WALK_LINE} {RASTER_STAYS_LINE} {RASTER_STILL_LINE}{" "}
            {RASTER_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-raster-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isRaster ? (
              <Badge variant="outline">I will not raster it</Badge>
            ) : (
              <Badge variant="ghost">Raster not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Raster paper
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
            {sheet.isRaster
              ? "Still for sale. Seller taped the raster note. Status stays available. Not a type shop."
              : "Still two weights. Still almost bold. Tape it when walkers still want the directory flattened."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isRaster ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not raster it"
              title={RASTER_NOTICE_TITLE}
              body={`${RASTER_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingRasterEmpty listingId={sheet.listingId} />
          )}

          <RasterForm listingId={sheet.listingId} isRaster={sheet.isRaster} />

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
