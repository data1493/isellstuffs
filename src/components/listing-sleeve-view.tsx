import Link from "next/link";

import { ListingSleeveEmpty } from "@/components/listing-sleeve-empty";
import { SyncSleeve } from "@/components/listing-sleeve-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  SLEEVE_BAG_LINE,
  SLEEVE_JACKET_LINE,
  SLEEVE_MIRROR_SCRIPT,
  SLEEVE_PRESS_LINE,
  SLEEVE_REFUSE_COPY,
  SLEEVE_SKIP_LINE,
  SLEEVE_STILL_LINE,
  SLEEVE_TABLE_LINE,
  SLEEVE_TOTE_LINE,
} from "@/lib/listing-sleeve";
import { listingPath, listingSleeveWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type SleeveViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type SleeveViewSheet = {
  kind: SleeveViewKind;
  listingId: string;
  isSleeve: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function SleeveMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={SLEEVE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function SleeveRefused({ sheet }: { sheet: SleeveViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-sleeve-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={SLEEVE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Grocery-bag sleeve is for a record on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {SLEEVE_TABLE_LINE} {SLEEVE_SKIP_LINE} {SLEEVE_STILL_LINE}
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

function SleeveForm({
  listingId,
  isSleeve,
}: {
  listingId: string;
  isSleeve: boolean;
}) {
  return (
    <form
      method="post"
      action={listingSleeveWritePath()}
      className="space-y-3"
      data-sleeve-form={isSleeve ? "open" : "sleeve"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isSleeve ? "open" : "sleeve"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/sleeve`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isSleeve ? "It has a real jacket" : SLEEVE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isSleeve
          ? "Clear the tape. Status and the tote stay put."
          : `${SLEEVE_BAG_LINE} ${SLEEVE_JACKET_LINE} ${SLEEVE_STILL_LINE} ${SLEEVE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingSleeveView({
  sheet,
  sleeveIds,
}: {
  sheet: SleeveViewSheet;
  sleeveIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <SleeveMissing />;
  }

  if (sheet.kind !== "physical") {
    return <SleeveRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-sleeve-sheet="physical"
      data-sleeve-state={sheet.isSleeve ? "sleeve" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: SLEEVE_MIRROR_SCRIPT }} />
      <SyncSleeve listingIds={sleeveIds} />

      <MallHero>
        <MallCrumb label="The grocery bag is the sleeve">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Sleeve</span>
        </MallCrumb>

        <MallEyebrow>Sleeve honesty</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isSleeve ? SLEEVE_TABLE_LINE : "The grocery bag is the sleeve."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SLEEVE_TABLE_LINE} {SLEEVE_SKIP_LINE} {SLEEVE_PRESS_LINE}{" "}
            {SLEEVE_BAG_LINE} {SLEEVE_JACKET_LINE} {SLEEVE_STILL_LINE}{" "}
            {SLEEVE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-sleeve-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isSleeve ? (
              <Badge variant="outline">Grocery bag sleeve</Badge>
            ) : (
              <Badge variant="ghost">No grocery bag tape</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Sleeve tag
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
            {sheet.isSleeve
              ? "Still for sale. Seller taped the grocery bag. Status stays available. Not a fourth status."
              : "Skip is the scratch. Tape the bag when the jacket walked and the LP lives in paper."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isSleeve ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Grocery bag sleeve"
              title={SLEEVE_TABLE_LINE}
              body={`${SLEEVE_BAG_LINE} ${SLEEVE_JACKET_LINE} ${SLEEVE_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingSleeveEmpty listingId={sheet.listingId} />
          )}

          <SleeveForm listingId={sheet.listingId} isSleeve={sheet.isSleeve} />

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
