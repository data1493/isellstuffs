import Link from "next/link";

import { ListingCardsEmpty } from "@/components/listing-cards-empty";
import { SyncCards } from "@/components/listing-cards-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  CARDS_MIRROR_SCRIPT,
  CARDS_NOTICE_TITLE,
  CARDS_REFUSE_COPY,
  CARDS_SCAN_LINE,
  CARDS_STILL_LINE,
  CARDS_TABLE_LINE,
  CARDS_TOTE_LINE,
  CARDS_VIBE_LINE,
} from "@/lib/listing-cards";
import { listingCardsWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type CardsViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type CardsViewSheet = {
  kind: CardsViewKind;
  listingId: string;
  isCards: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function CardsMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={CARDS_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function CardsRefused({ sheet }: { sheet: CardsViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-cards-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={CARDS_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Typed-card honesty is for a scanned stack on the digital lot, not a mug and not a gift code."
              )}
            </p>
            <p>
              {CARDS_NOTICE_TITLE} {CARDS_VIBE_LINE} {CARDS_STILL_LINE}
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

function CardsForm({
  listingId,
  isCards,
}: {
  listingId: string;
  isCards: boolean;
}) {
  return (
    <form
      method="post"
      action={listingCardsWritePath()}
      className="space-y-3"
      data-cards-form={isCards ? "open" : "cards"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isCards ? "open" : "cards"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/cards`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isCards ? "Leave the scans" : "I will not type them"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isCards
          ? "Clear the cards paper. Status and the tote stay put."
          : `${CARDS_SCAN_LINE} ${CARDS_VIBE_LINE} ${CARDS_STILL_LINE} ${CARDS_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingCardsView({
  sheet,
  cardsIds,
}: {
  sheet: CardsViewSheet;
  cardsIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <CardsMissing />;
  }

  if (sheet.kind !== "digital") {
    return <CardsRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-cards-sheet="digital"
      data-cards-state={sheet.isCards ? "cards" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: CARDS_MIRROR_SCRIPT }} />
      <SyncCards listingIds={cardsIds} />

      <MallHero>
        <MallCrumb label="I will not type them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Cards</span>
        </MallCrumb>

        <MallEyebrow>I will not type them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isCards ? CARDS_NOTICE_TITLE : "The cards stay scans."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {CARDS_NOTICE_TITLE} {CARDS_VIBE_LINE} {CARDS_STILL_LINE}{" "}
            {CARDS_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-cards-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isCards ? (
              <Badge variant="outline">I will not type them</Badge>
            ) : (
              <Badge variant="ghost">Cards still scans</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Cards paper
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
            {sheet.isCards
              ? "Still for sale. Seller taped that the scans stay scans. Walkers still ask Sink Drawer to type them. Status stays available."
              : "The cards stay scans. Tape it when walkers still want a typed cookbook."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isCards ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not type them"
              title={CARDS_NOTICE_TITLE}
              body={`${CARDS_STILL_LINE} avail=open still lists this file. ${CARDS_SCAN_LINE}`}
            />
          ) : (
            <ListingCardsEmpty listingId={sheet.listingId} />
          )}

          <CardsForm listingId={sheet.listingId} isCards={sheet.isCards} />

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
