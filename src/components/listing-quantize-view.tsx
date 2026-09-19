import Link from "next/link";

import { ListingQuantizeEmpty } from "@/components/listing-quantize-empty";
import { SyncQuantize } from "@/components/listing-quantize-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  QUANTIZE_LEAVE_LINE,
  QUANTIZE_MIRROR_SCRIPT,
  QUANTIZE_NOTICE_TITLE,
  QUANTIZE_REFUSE_COPY,
  QUANTIZE_SHOTS_LINE,
  QUANTIZE_STAYS_LINE,
  QUANTIZE_STILL_LINE,
  QUANTIZE_TABLE_LINE,
  QUANTIZE_TOTE_LINE,
  QUANTIZE_WALK_LINE,
  QUANTIZE_ZIP_LINE,
} from "@/lib/listing-quantize";
import { listingPath, listingQuantizeWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type QuantizeViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "recipes"
  | "missing";

export type QuantizeViewSheet = {
  kind: QuantizeViewKind;
  listingId: string;
  isQuantize: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function QuantizeMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={QUANTIZE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function QuantizeRefused({ sheet }: { sheet: QuantizeViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const recipes = sheet.kind === "recipes";

  return (
    <div data-quantize-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift ? "Gift desk" : recipes ? "Recipe cards" : object ? "On the table" : "Walked"
        }
        title={QUANTIZE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A quantize note is for twelve shots and a zip, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {QUANTIZE_TABLE_LINE} {QUANTIZE_SHOTS_LINE} {QUANTIZE_ZIP_LINE}{" "}
              {QUANTIZE_STILL_LINE}
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

function QuantizeForm({
  listingId,
  isQuantize,
}: {
  listingId: string;
  isQuantize: boolean;
}) {
  return (
    <form
      method="post"
      action={listingQuantizeWritePath()}
      className="space-y-3"
      data-quantize-form={isQuantize ? "open" : "quantize"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isQuantize ? "open" : "quantize"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/quantize`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isQuantize ? QUANTIZE_LEAVE_LINE : QUANTIZE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isQuantize
          ? "Clear the tape. Status and the tote stay put."
          : `${QUANTIZE_STAYS_LINE} ${QUANTIZE_SHOTS_LINE} ${QUANTIZE_ZIP_LINE} ${QUANTIZE_STILL_LINE} ${QUANTIZE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingQuantizeView({
  sheet,
  quantizeIds,
}: {
  sheet: QuantizeViewSheet;
  quantizeIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <QuantizeMissing />;
  }

  if (sheet.kind !== "digital") {
    return <QuantizeRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-quantize-sheet="digital"
      data-quantize-state={sheet.isQuantize ? "quantize" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: QUANTIZE_MIRROR_SCRIPT }} />
      <SyncQuantize listingIds={quantizeIds} />

      <MallHero>
        <MallCrumb label="I will not quantize them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Quantize</span>
        </MallCrumb>

        <MallEyebrow>I will not quantize them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isQuantize ? QUANTIZE_NOTICE_TITLE : QUANTIZE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {QUANTIZE_TABLE_LINE} {QUANTIZE_SHOTS_LINE} {QUANTIZE_ZIP_LINE}{" "}
            {QUANTIZE_WALK_LINE} {QUANTIZE_STAYS_LINE} {QUANTIZE_STILL_LINE}{" "}
            {QUANTIZE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-quantize-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isQuantize ? (
              <Badge variant="outline">I will not quantize them</Badge>
            ) : (
              <Badge variant="ghost">Still twelve shots</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Quantize paper
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
            {sheet.isQuantize
              ? "Still for sale. Seller taped the quantize note. Status stays available. Not a mix."
              : "Still twelve shots. Still a zip. Tape it when walkers still want the kicks on the grid."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isQuantize ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not quantize them"
              title={QUANTIZE_NOTICE_TITLE}
              body={`${QUANTIZE_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingQuantizeEmpty listingId={sheet.listingId} />
          )}

          <QuantizeForm listingId={sheet.listingId} isQuantize={sheet.isQuantize} />

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
