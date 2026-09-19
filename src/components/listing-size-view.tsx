import Link from "next/link";

import { ListingSizeEmpty } from "@/components/listing-size-empty";
import { SyncSize } from "@/components/listing-size-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  SIZE_LIE_LINE,
  SIZE_MIRROR_SCRIPT,
  SIZE_PRESS_LINE,
  SIZE_REFUSE_COPY,
  SIZE_STILL_LINE,
  SIZE_TABLE_LINE,
  SIZE_TOTE_LINE,
} from "@/lib/listing-size";
import { listingPath, listingSizeWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type SizeViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type SizeViewSheet = {
  kind: SizeViewKind;
  listingId: string;
  isSize: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function SizeMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={SIZE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function SizeRefused({ sheet }: { sheet: SizeViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-size-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={SIZE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Size honesty is for a jacket on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {SIZE_TABLE_LINE} {SIZE_PRESS_LINE} {SIZE_LIE_LINE}{" "}
              {SIZE_STILL_LINE}
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

function SizeForm({
  listingId,
  isSize,
}: {
  listingId: string;
  isSize: boolean;
}) {
  return (
    <form
      method="post"
      action={listingSizeWritePath()}
      className="space-y-3"
      data-size-form={isSize ? "open" : "size"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isSize ? "open" : "size"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/size`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isSize ? "Fits the tag" : "Tag says L"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isSize
          ? "Clear the tape. Status and the tote stay put."
          : `${SIZE_PRESS_LINE} ${SIZE_LIE_LINE} ${SIZE_STILL_LINE} ${SIZE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingSizeView({
  sheet,
  sizeIds,
}: {
  sheet: SizeViewSheet;
  sizeIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <SizeMissing />;
  }

  if (sheet.kind !== "physical") {
    return <SizeRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-size-sheet="physical"
      data-size-state={sheet.isSize ? "size" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: SIZE_MIRROR_SCRIPT }} />
      <SyncSize listingIds={sizeIds} />

      <MallHero>
        <MallCrumb label="Tag says L">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Size</span>
        </MallCrumb>

        <MallEyebrow>Garment honesty</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isSize ? SIZE_TABLE_LINE : "Tag says L."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SIZE_TABLE_LINE} {SIZE_PRESS_LINE} {SIZE_LIE_LINE}{" "}
            {SIZE_STILL_LINE} {SIZE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-size-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isSize ? (
              <Badge variant="outline">Tag says L</Badge>
            ) : (
              <Badge variant="ghost">Fits the tag</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Size tag
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
            {sheet.isSize
              ? "Still for sale. Seller taped the lying tag. Walkers still try it on. Status stays available."
              : "Press is which pressing. Tape the L when the Closet tag lied."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isSize ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Tag says L"
              title={SIZE_TABLE_LINE}
              body={`${SIZE_STILL_LINE} avail=open still lists this pile. ${SIZE_LIE_LINE}`}
            />
          ) : (
            <ListingSizeEmpty listingId={sheet.listingId} />
          )}

          <SizeForm listingId={sheet.listingId} isSize={sheet.isSize} />

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
