import Link from "next/link";

import { SyncFirm } from "@/components/listing-firm-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  FIRM_EMPTY_LINE,
  FIRM_FILE_COPY,
  FIRM_GIFT_COPY,
  FIRM_GONE_COPY,
  FIRM_MIRROR_SCRIPT,
  FIRM_MISSING_COPY,
  FIRM_OFFER_LINE,
  FIRM_SELLER_LINE,
  FIRM_SOLD_COPY,
  FIRM_TABLE_LINE,
  FIRM_TOTE_LINE,
} from "@/lib/firm-price";
import { listingFirmTapePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type FirmViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type FirmViewSheet = {
  kind: FirmViewKind;
  listingId: string;
  isFirm: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function FirmMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={FIRM_MISSING_COPY}
      body="No SKU with that id. It never sat on a table, or the paper tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function FirmRefused({ sheet }: { sheet: FirmViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const title = gift
    ? FIRM_GIFT_COPY
    : file
      ? sheet.kind === "file-gone"
        ? FIRM_GONE_COPY
        : FIRM_FILE_COPY
      : FIRM_SOLD_COPY;

  return (
    <MallNotice
      tone="empty"
      eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
      title={title}
      body={
        <div className="space-y-2" data-firm-sheet={sheet.kind}>
          <p>
            {sheet.fact ? (
              <>
                <span className="font-medium text-foreground">{sheet.fact}</span>
                {sheet.stallName ? <> · {sheet.stallName}</> : null}
              </>
            ) : (
              "Firm paper is for a tag on the table, not a PDF and not a gift code."
            )}
          </p>
          <p>{FIRM_TABLE_LINE}</p>
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
  );
}

function FirmForm({
  listingId,
  isFirm,
}: {
  listingId: string;
  isFirm: boolean;
}) {
  return (
    <form
      method="post"
      action={listingFirmTapePath(listingId)}
      className="space-y-3"
      data-firm-form={isFirm ? "open" : "firm"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isFirm ? "open" : "firm"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/firm`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isFirm ? "Will take a scrap" : FIRM_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isFirm
          ? "Peel the firm paper. The tag and the tote stay put."
          : `${FIRM_SELLER_LINE} ${FIRM_TOTE_LINE} ${FIRM_OFFER_LINE}`}
      </p>
    </form>
  );
}

export function ListingFirmView({
  sheet,
  firmIds,
}: {
  sheet: FirmViewSheet;
  firmIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <FirmMissing />;
  }

  if (sheet.kind !== "physical") {
    return <FirmRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-firm-sheet="physical"
      data-firm-state={sheet.isFirm ? "firm" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: FIRM_MIRROR_SCRIPT }} />
      <SyncFirm listingIds={firmIds} />

      <MallHero>
        <MallCrumb label="That's the price">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Firm</span>
        </MallCrumb>

        <MallEyebrow>Firm paper</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {FIRM_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {FIRM_SELLER_LINE} {FIRM_TOTE_LINE} {FIRM_OFFER_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-firm-listing={sheet.listingId}
          className="w-full max-w-[5in] rounded-sm border-2 border-foreground/70 bg-card px-5 py-6 sm:max-w-none sm:rounded-2xl sm:border-0 sm:p-6 sm:ring-1 sm:ring-primary/15"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">Asking tag</MallEyebrow>
            {sheet.isFirm ? (
              <Badge variant="outline">{FIRM_TABLE_LINE}</Badge>
            ) : (
              <Badge variant="ghost">Will take a scrap</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Still the tag
          </p>
          <p
            data-firm-tag=""
            className="mt-1 font-heading text-5xl tracking-tight sm:text-6xl"
          >
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
            {sheet.isFirm
              ? "The seller taped this. The number does not move. The tote still rings this tag."
              : "Tape firm paper when the tag is the tag. An $8 scrap is a different slip."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isFirm ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="That's the price"
              title={FIRM_TABLE_LINE}
              body={`${FIRM_SELLER_LINE} ${FIRM_TOTE_LINE}`}
            />
          ) : (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Will take a scrap"
              title={FIRM_EMPTY_LINE}
              body="Tape firm paper when you will not move. It does not change the tag or the tote."
            />
          )}

          <FirmForm listingId={sheet.listingId} isFirm={sheet.isFirm} />

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
