import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DIGITAL_FILE_LINE,
  DIGITAL_FOLDER_LINE,
  GIFT_DESK_LINE,
  PHYSICAL_HAND_LINE,
  TAG_MISSING_COPY,
  type PriceTagSheet,
} from "@/lib/price-tag";
import { giftPath, listingPath } from "@/lib/paths";

function TagMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={TAG_MISSING_COPY}
      body="No SKU with that id. It never sat on a table, or the tag tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function FileHasNoTag({ tag }: { tag: PriceTagSheet }) {
  const gift = tag.kind === "gift";

  return (
    <MallNotice
      tone="empty"
      eyebrow="Files stay in the folder"
      title={gift ? "No tag for a gift card." : "No tag for a file."}
      body={
        <div className="space-y-2" data-price-tag={tag.kind}>
          <p>
            {tag.fact ? (
              <>
                <span className="font-medium text-foreground">{tag.fact}</span>
                {tag.stallName ? <> · {tag.stallName}</> : null}
              </>
            ) : null}
          </p>
          <p>{gift ? GIFT_DESK_LINE : DIGITAL_FOLDER_LINE}</p>
          {gift ? null : <p>{DIGITAL_FILE_LINE}</p>}
        </div>
      }
      actions={
        <>
          {tag.listing ? (
            <Button
              className="rounded-full px-5"
              render={<Link href={listingPath(tag.listing.id)} />}
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

function DrivewayCard({ tag }: { tag: PriceTagSheet }) {
  return (
    <article
      data-price-tag="physical"
      className="driveway-tag-print w-full max-w-[5in] rounded-sm border-2 border-foreground/70 bg-card px-5 py-6 print:h-[3in] print:w-[5in] print:rounded-none print:border-black print:bg-white"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <MallEyebrow className="text-current/55">3×5 driveway tag</MallEyebrow>
        {tag.statusWord ? (
          <Badge variant="destructive">{tag.statusWord}</Badge>
        ) : null}
      </div>

      <p
        data-tag-price=""
        className="mt-4 font-heading text-5xl tracking-tight sm:text-6xl"
      >
        {tag.priceLabel}
      </p>

      <h2 className="mt-3 font-heading text-2xl leading-snug tracking-tight text-balance">
        {tag.title}
      </h2>

      {tag.fact ? (
        <p data-tag-condition="" className="mt-2 text-sm leading-6 text-foreground">
          {tag.fact}
        </p>
      ) : null}

      <dl className="mt-5 grid gap-2 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Stall
          </dt>
          <dd data-tag-stall="" className="mt-0.5 font-medium">
            {tag.stallName}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Aisle
          </dt>
          <dd data-tag-hub="" className="mt-0.5 font-medium">
            {tag.hubName}
          </dd>
        </div>
      </dl>

      <p className="mt-5 text-sm leading-6 text-foreground">{tag.refuse}</p>
      <p className="text-sm leading-6 text-muted-foreground">
        {PHYSICAL_HAND_LINE}
      </p>
    </article>
  );
}

export function PriceTagView({ tag }: { tag: PriceTagSheet }) {
  if (tag.kind === "missing") {
    return <TagMissing />;
  }

  if (tag.kind !== "physical") {
    return <FileHasNoTag tag={tag} />;
  }

  return (
    <div>
      <MallHero className="print:hidden">
        <MallCrumb label="Driveway tag">
          <CrumbSep />
          <Link
            href={listingPath(tag.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {tag.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Tag</span>
        </MallCrumb>

        <MallEyebrow>Printable 3×5</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Tape this to the lamp.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            A driveway price tag. Screenshot it or print it. Pay the mall, then
            the table. We do not ship.
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid max-w-2xl gap-6"
      >
        <DrivewayCard tag={tag} />

        <div className="flex flex-col gap-3 print:hidden">
          <Button
            className="w-full rounded-full sm:w-auto"
            render={<Link href={listingPath(tag.listingId)} />}
          >
            Back to the listing
          </Button>
        </div>
      </MallSection>
    </div>
  );
}
