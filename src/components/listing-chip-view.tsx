import Link from "next/link";

import { ListingChipEmpty } from "@/components/listing-chip-empty";
import { SyncChip } from "@/components/listing-chip-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  CHIP_HEAT_LINE,
  CHIP_MIRROR_SCRIPT,
  CHIP_REFUSE_COPY,
  CHIP_RIM_LINE,
  CHIP_STILL_LINE,
  CHIP_TABLE_LINE,
  CHIP_TOTE_LINE,
} from "@/lib/listing-chip";
import { listingChipWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type ChipViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type ChipViewSheet = {
  kind: ChipViewKind;
  listingId: string;
  isChip: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function ChipMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={CHIP_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function ChipRefused({ sheet }: { sheet: ChipViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-chip-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={CHIP_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Chip honesty is for a diner mug on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {CHIP_TABLE_LINE} {CHIP_RIM_LINE} {CHIP_STILL_LINE}
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

function ChipForm({
  listingId,
  isChip,
}: {
  listingId: string;
  isChip: boolean;
}) {
  return (
    <form
      method="post"
      action={listingChipWritePath()}
      className="space-y-3"
      data-chip-form={isChip ? "open" : "chip"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isChip ? "open" : "chip"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/chip`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isChip ? "Rim is fine" : "The chip stays"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isChip
          ? "Clear the tape. Status and the tote stay put."
          : `${CHIP_RIM_LINE} ${CHIP_STILL_LINE} ${CHIP_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingChipView({
  sheet,
  chipIds,
}: {
  sheet: ChipViewSheet;
  chipIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <ChipMissing />;
  }

  if (sheet.kind !== "physical") {
    return <ChipRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-chip-sheet="physical"
      data-chip-state={sheet.isChip ? "chip" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: CHIP_MIRROR_SCRIPT }} />
      <SyncChip listingIds={chipIds} />

      <MallHero>
        <MallCrumb label="The chip stays">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Chip</span>
        </MallCrumb>

        <MallEyebrow>Chip honesty</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isChip ? CHIP_TABLE_LINE : "The chip stays."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {CHIP_TABLE_LINE} {CHIP_RIM_LINE} {CHIP_STILL_LINE} {CHIP_TOTE_LINE}{" "}
            {CHIP_HEAT_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-chip-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isChip ? (
              <Badge variant="outline">The chip stays</Badge>
            ) : (
              <Badge variant="ghost">Rim is fine</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Chip tag
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
            {sheet.isChip
              ? "Still for sale. Seller taped the chip. Status stays available. Not a fourth status."
              : "Heat is don't microwave. Tape the chip when the diner rim already lost a piece."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isChip ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="The chip stays"
              title={CHIP_TABLE_LINE}
              body={`${CHIP_RIM_LINE} ${CHIP_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingChipEmpty listingId={sheet.listingId} />
          )}

          <ChipForm listingId={sheet.listingId} isChip={sheet.isChip} />

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
