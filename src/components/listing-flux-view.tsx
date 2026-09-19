import Link from "next/link";

import { ListingFluxEmpty } from "@/components/listing-flux-empty";
import { SyncFlux } from "@/components/listing-flux-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  FLUX_LEAVE_LINE,
  FLUX_MIRROR_SCRIPT,
  FLUX_NOTICE_TITLE,
  FLUX_REFUSE_COPY,
  FLUX_STAYS_LINE,
  FLUX_STILL_LINE,
  FLUX_TABLE_LINE,
  FLUX_TANGLE_LINE,
  FLUX_TOTE_LINE,
  FLUX_UNTESTED_LINE,
  FLUX_WALK_LINE,
} from "@/lib/listing-flux";
import { listingFluxWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type FluxViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "boy"
  | "lid"
  | "chair"
  | "owned";

export type FluxViewSheet = {
  kind: FluxViewKind;
  listingId: string;
  isFlux: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function FluxMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={FLUX_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function FluxRefused({ sheet }: { sheet: FluxViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const boy = sheet.kind === "boy";
  const lid = sheet.kind === "lid";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-flux-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : boy
                ? "A Game Boy is not a cable pile"
                : lid
                  ? "A lid is not a cable pile"
                  : chair
                    ? "A chair is not a cable pile"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={FLUX_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A flux note is for the mystery cable drawer on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {FLUX_TABLE_LINE} {FLUX_TANGLE_LINE} {FLUX_UNTESTED_LINE}{" "}
              {FLUX_STILL_LINE}
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

function FluxForm({
  listingId,
  isFlux,
}: {
  listingId: string;
  isFlux: boolean;
}) {
  return (
    <form
      method="post"
      action={listingFluxWritePath()}
      className="space-y-3"
      data-flux-form={isFlux ? "open" : "flux"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isFlux ? "open" : "flux"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/flux`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isFlux ? FLUX_LEAVE_LINE : FLUX_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isFlux
          ? "Clear the tape. Status and the tote stay put."
          : `${FLUX_STAYS_LINE} ${FLUX_TANGLE_LINE} ${FLUX_UNTESTED_LINE} ${FLUX_STILL_LINE} ${FLUX_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingFluxView({
  sheet,
  fluxIds,
}: {
  sheet: FluxViewSheet;
  fluxIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <FluxMissing />;
  }

  if (sheet.kind !== "physical") {
    return <FluxRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-flux-sheet="physical"
      data-flux-state={sheet.isFlux ? "flux" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: FLUX_MIRROR_SCRIPT }} />
      <SyncFlux listingIds={fluxIds} />

      <MallHero>
        <MallCrumb label="I will not flux them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Flux</span>
        </MallCrumb>

        <MallEyebrow>I will not flux them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isFlux ? FLUX_NOTICE_TITLE : FLUX_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {FLUX_TABLE_LINE} {FLUX_TANGLE_LINE} {FLUX_UNTESTED_LINE}{" "}
            {FLUX_WALK_LINE} {FLUX_STAYS_LINE} {FLUX_STILL_LINE}{" "}
            {FLUX_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-flux-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isFlux ? (
              <Badge variant="outline">I will not flux them</Badge>
            ) : (
              <Badge variant="ghost">Flux not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Flux paper
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
            {sheet.isFlux
              ? "Still for sale. Seller taped the flux note. Status stays available. Not a shop."
              : "Still a tangle. Still untested. Tape it when walkers still want the ends fluxed."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isFlux ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not flux them"
              title={FLUX_NOTICE_TITLE}
              body={`${FLUX_STILL_LINE} avail=open still lists this drawer.`}
            />
          ) : (
            <ListingFluxEmpty listingId={sheet.listingId} />
          )}

          <FluxForm listingId={sheet.listingId} isFlux={sheet.isFlux} />

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
