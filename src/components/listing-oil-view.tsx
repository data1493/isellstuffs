import Link from "next/link";

import { ListingOilEmpty } from "@/components/listing-oil-empty";
import { SyncOil } from "@/components/listing-oil-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  OIL_HINGE_LINE,
  OIL_MIRROR_SCRIPT,
  OIL_REFUSE_COPY,
  OIL_SQUEAK_LINE,
  OIL_STILL_LINE,
  OIL_TABLE_LINE,
  OIL_TOTE_LINE,
} from "@/lib/listing-oil";
import { listingOilWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type OilViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type OilViewSheet = {
  kind: OilViewKind;
  listingId: string;
  isOil: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function OilMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={OIL_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function OilRefused({ sheet }: { sheet: OilViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-oil-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={OIL_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Oil honesty is for a kitchen tool on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {OIL_TABLE_LINE} {OIL_HINGE_LINE} {OIL_STILL_LINE}
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

function OilForm({
  listingId,
  isOil,
}: {
  listingId: string;
  isOil: boolean;
}) {
  return (
    <form
      method="post"
      action={listingOilWritePath()}
      className="space-y-3"
      data-oil-form={isOil ? "open" : "oil"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isOil ? "open" : "oil"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/oil`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isOil ? "It does not squeak" : "Needs a drop of oil"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isOil
          ? "Clear the tape. Status and the tote stay put."
          : `${OIL_SQUEAK_LINE} ${OIL_STILL_LINE} ${OIL_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingOilView({
  sheet,
  oilIds,
}: {
  sheet: OilViewSheet;
  oilIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <OilMissing />;
  }

  if (sheet.kind !== "physical") {
    return <OilRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-oil-sheet="physical"
      data-oil-state={sheet.isOil ? "oil" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: OIL_MIRROR_SCRIPT }} />
      <SyncOil listingIds={oilIds} />

      <MallHero>
        <MallCrumb label="Needs a drop of oil">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Oil</span>
        </MallCrumb>

        <MallEyebrow>Oil honesty</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isOil ? OIL_TABLE_LINE : "Needs a drop of oil."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {OIL_TABLE_LINE} {OIL_HINGE_LINE} {OIL_SQUEAK_LINE} {OIL_STILL_LINE}{" "}
            {OIL_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-oil-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isOil ? (
              <Badge variant="outline">Needs a drop of oil</Badge>
            ) : (
              <Badge variant="ghost">No oil tape</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Oil tag
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
            {sheet.isOil
              ? "Still for sale. Seller taped the squeak. Status stays available. Not a fourth status."
              : "Hinge is the jewel snap. Tape the oil when the kitchen tool already squeaks."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isOil ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Needs a drop of oil"
              title={OIL_TABLE_LINE}
              body={`${OIL_SQUEAK_LINE} ${OIL_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingOilEmpty listingId={sheet.listingId} />
          )}

          <OilForm listingId={sheet.listingId} isOil={sheet.isOil} />

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
