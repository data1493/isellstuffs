import Link from "next/link";

import { ListingOfferForm } from "@/components/listing-offer-form";
import { ListingOfferScrap } from "@/components/listing-offer-scrap";
import { SyncOffers } from "@/components/listing-offer-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DIGITAL_FOLDER_LINE,
  GIFT_DESK_LINE,
  OFFER_FILE_COPY,
  OFFER_GIFT_COPY,
  OFFER_MISSING_COPY,
  OFFER_PAPER_LINE,
  OFFER_SOLD_COPY,
  OFFER_TOTE_LINE,
  type ListingOffer,
  type OfferSheet,
} from "@/lib/listing-offer";
import { giftPath, listingPath, sellDeskStallPath } from "@/lib/paths";

function OfferMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={OFFER_MISSING_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function FileHasNoOffer({ sheet }: { sheet: OfferSheet }) {
  const gift = sheet.kind === "gift";

  return (
    <MallNotice
      tone="empty"
      eyebrow="Files stay in the folder"
      title={gift ? OFFER_GIFT_COPY : OFFER_FILE_COPY}
      body={
        <div className="space-y-2" data-offer-sheet={sheet.kind}>
          <p>
            {sheet.fact ? (
              <>
                <span className="font-medium text-foreground">{sheet.fact}</span>
                {sheet.stallName ? <> · {sheet.stallName}</> : null}
              </>
            ) : null}
          </p>
          <p>{gift ? GIFT_DESK_LINE : DIGITAL_FOLDER_LINE}</p>
          <p>Haggling is for things on the table.</p>
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
          {gift ? (
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href={giftPath()} />}
            >
              Gift desk
            </Button>
          ) : null}
        </>
      }
    />
  );
}

function HaggleCard({ sheet }: { sheet: OfferSheet }) {
  return (
    <article
      data-offer-sheet="physical"
      className="w-full max-w-[5in] rounded-sm border-2 border-foreground/70 bg-card px-5 py-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <MallEyebrow className="text-current/55">Paper haggle</MallEyebrow>
        {sheet.statusWord ? (
          <Badge variant="destructive">{sheet.statusWord}</Badge>
        ) : null}
      </div>

      <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Asking tag
      </p>
      <p
        data-offer-tag=""
        className="mt-1 font-heading text-5xl tracking-tight sm:text-6xl"
      >
        {sheet.tagLabel}
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

      <p className="mt-5 text-sm leading-6 text-foreground">{sheet.refuse}</p>
      <p className="text-sm leading-6 text-muted-foreground">{OFFER_TOTE_LINE}</p>
    </article>
  );
}

export function ListingOfferView({
  sheet,
  offers,
  tapeError,
}: {
  sheet: OfferSheet;
  offers: ListingOffer[];
  tapeError?: string;
}) {
  if (sheet.kind === "missing") {
    return <OfferMissing />;
  }

  if (sheet.kind !== "physical") {
    return <FileHasNoOffer sheet={sheet} />;
  }

  const deskHref = sheet.stallSlug ? sellDeskStallPath(sheet.stallSlug) : null;

  return (
    <div>
      <SyncOffers offers={offers} />

      <MallHero>
        <MallCrumb label="Offer slip">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Offer</span>
        </MallCrumb>

        <MallEyebrow>Paper haggle</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Tape a number on the lamp.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {OFFER_PAPER_LINE} {OFFER_TOTE_LINE} The stall desk can see the
            scrap.
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <div className="space-y-6">
          <HaggleCard sheet={sheet} />

          <div className="flex flex-col gap-3">
            <Button
              className="w-full rounded-full sm:w-auto"
              render={<Link href={listingPath(sheet.listingId)} />}
            >
              Back to the listing
            </Button>
            {deskHref ? (
              <Button
                variant="outline"
                className="w-full rounded-full sm:w-auto"
                render={<Link href={deskHref} />}
              >
                Open the stall desk
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          {tapeError === "empty" ? (
            <MallNotice
              tone="error"
              padded={false}
              titleAs="h2"
              eyebrow="Blank scrap"
              title="Tape a number or leave the lamp."
              body="Empty tape does not stick. Write dollars — eight on a twelve-dollar lamp — then tape it."
            />
          ) : null}

          {tapeError === "sold" ? (
            <MallNotice
              tone="error"
              padded={false}
              titleAs="h2"
              eyebrow="Walked"
              title={OFFER_SOLD_COPY}
              body="Sold stickers do not take scraps. The tote still rings whatever is left on the table."
            />
          ) : null}

          {sheet.canTape ? (
            <ListingOfferForm
              listingId={sheet.listingId}
              tagLabel={sheet.tagLabel ?? ""}
            />
          ) : (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Walked"
              title={OFFER_SOLD_COPY}
              body="This lamp already left. A scrap here does not unsell it."
            />
          )}

          {offers.length > 0
            ? offers.map((offer) => (
                <ListingOfferScrap
                  key={offer.id}
                  offer={offer}
                  tagLabel={sheet.tagLabel ?? ""}
                  title={sheet.title}
                />
              ))
            : sheet.canTape && tapeError !== "empty" ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  Nobody taped a number on this lamp in this browser.
                </p>
              ) : null}
        </div>
      </MallSection>
    </div>
  );
}
