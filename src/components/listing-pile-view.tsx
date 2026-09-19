import Link from "next/link";

import { ListingPileEmpty } from "@/components/listing-pile-empty";
import { SyncPile } from "@/components/listing-pile-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  PILE_MIRROR_SCRIPT,
  PILE_PARTS_LINE,
  PILE_REFUSE_COPY,
  PILE_STILL_LINE,
  PILE_TABLE_LINE,
  PILE_TAKE_LINE,
  PILE_TOTE_LINE,
  PILE_USB_LINE,
} from "@/lib/listing-pile";
import { listingPath, listingPileWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type PileViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type PileViewSheet = {
  kind: PileViewKind;
  listingId: string;
  isPile: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function PileMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={PILE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function PileRefused({ sheet }: { sheet: PileViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-pile-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={PILE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Won't split the pile is for a tangle on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {PILE_TABLE_LINE} {PILE_TAKE_LINE} {PILE_PARTS_LINE} {PILE_USB_LINE}{" "}
              {PILE_STILL_LINE}
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

function PileForm({
  listingId,
  isPile,
}: {
  listingId: string;
  isPile: boolean;
}) {
  return (
    <form
      method="post"
      action={listingPileWritePath()}
      className="space-y-3"
      data-pile-form={isPile ? "open" : "pile"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isPile ? "open" : "pile"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/pile`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isPile ? "You can pick one" : "Won't split the pile"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isPile
          ? "Clear the tape. Status and the tote stay put."
          : `${PILE_TAKE_LINE} ${PILE_PARTS_LINE} ${PILE_USB_LINE} ${PILE_STILL_LINE} ${PILE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingPileView({
  sheet,
  pileIds,
}: {
  sheet: PileViewSheet;
  pileIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <PileMissing />;
  }

  if (sheet.kind !== "physical") {
    return <PileRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-pile-sheet="physical"
      data-pile-state={sheet.isPile ? "pile" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: PILE_MIRROR_SCRIPT }} />
      <SyncPile listingIds={pileIds} />

      <MallHero>
        <MallCrumb label="Won't split the pile">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Pile</span>
        </MallCrumb>

        <MallEyebrow>Won&apos;t split the pile</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isPile ? PILE_TABLE_LINE : "Won't split the pile."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {PILE_TABLE_LINE} {PILE_TAKE_LINE} {PILE_PARTS_LINE} {PILE_USB_LINE}{" "}
            {PILE_STILL_LINE} {PILE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-pile-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isPile ? (
              <Badge variant="outline">Won&apos;t split the pile</Badge>
            ) : (
              <Badge variant="ghost">You can pick one</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Pile tape
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
            {sheet.isPile
              ? "Still for sale. Seller taped the whole drawer. Walkers still try one USB. Status stays available."
              : "Parts is it does not run. Tape the pile when the tangle walks as one drawer."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isPile ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Won't split the pile"
              title={PILE_TABLE_LINE}
              body={`${PILE_TAKE_LINE} ${PILE_STILL_LINE} avail=open still lists this pile. ${PILE_USB_LINE}`}
            />
          ) : (
            <ListingPileEmpty listingId={sheet.listingId} />
          )}

          <PileForm listingId={sheet.listingId} isPile={sheet.isPile} />

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
