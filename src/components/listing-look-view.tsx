import Link from "next/link";

import { SyncLook } from "@/components/listing-look-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { CART_MIRROR_SCRIPT } from "@/lib/cart";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  LOOK_FILE_COPY,
  LOOK_GIFT_COPY,
  LOOK_GONE_COPY,
  LOOK_LOT_LINE,
  LOOK_MIRROR_SCRIPT,
  LOOK_MISSING_COPY,
  LOOK_SOLD_COPY,
  LOOK_TABLE_LINE,
  LOOK_TOTE_LINE,
} from "@/lib/look-overlay";
import {
  listingLookWritePath,
  listingPath,
  lotPath,
  stallPath,
} from "@/lib/paths";
import { cn } from "@/lib/utils";

export type LookViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type LookViewSheet = {
  kind: LookViewKind;
  listingId: string;
  looking: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function LookMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={LOOK_MISSING_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function LookRefused({ sheet }: { sheet: LookViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const title = gift
    ? LOOK_GIFT_COPY
    : file
      ? sheet.kind === "file-gone"
        ? LOOK_GONE_COPY
        : LOOK_FILE_COPY
      : LOOK_SOLD_COPY;

  return (
    <MallNotice
      tone="empty"
      eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
      title={title}
      body={
        <div className="space-y-2" data-look-sheet={sheet.kind}>
          <p>
            {sheet.fact ? (
              <>
                <span className="font-medium text-foreground">{sheet.fact}</span>
                {sheet.stallName ? <> · {sheet.stallName}</> : null}
              </>
            ) : (
              "Look is a lamp on the table, not a PDF and not a gift code."
            )}
          </p>
          <p>{LOOK_TABLE_LINE}</p>
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

function LookForm({
  listingId,
  looking,
}: {
  listingId: string;
  looking: boolean;
}) {
  return (
    <form
      method="post"
      action={listingLookWritePath()}
      className="space-y-3"
      data-look-form={looking ? "open" : "look"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={looking ? "open" : "look"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/look`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {looking ? "Sell again" : "Look, don't bag"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {looking
          ? "Sell-again restores the tote. Status stays on the table."
          : `${LOOK_TOTE_LINE} ${LOOK_LOT_LINE}`}
      </p>
    </form>
  );
}

export function ListingLookView({
  sheet,
  lookIds,
}: {
  sheet: LookViewSheet;
  lookIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <LookMissing />;
  }

  if (sheet.kind !== "physical") {
    return <LookRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div data-look-sheet="physical" data-look-state={sheet.looking ? "look" : "open"}>
      <script dangerouslySetInnerHTML={{ __html: LOOK_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: CART_MIRROR_SCRIPT }} />
      <SyncLook listingIds={lookIds} />

      <MallHero>
        <MallCrumb label="Look, don't bag">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Look</span>
        </MallCrumb>

        <MallEyebrow>Display piece</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.looking
              ? "This sits on the table."
              : "Look, don't bag."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {LOOK_TABLE_LINE} {LOOK_TOTE_LINE} {LOOK_LOT_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-look-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.looking ? (
              <Badge variant="outline">Look only</Badge>
            ) : (
              <Badge variant="ghost">Still for sale</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Asking tag
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
            {sheet.looking
              ? "The tote dropped it. Still-here explore does not list it. Status is still available — this is not a sold sticker."
              : "The nice lamp that sits on the table and is not for sale. Garage is the car. Sold already walked."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.looking ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Look only"
              title="Not in the tote."
              body="avail=open dropped this lamp. Folding Table Tuesday is still on the lot. Sell-again restores Add to cart."
            />
          ) : (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Still for sale"
              title="Nobody looked this yet."
              body="Look takes it out of the tote aisle without packing the booth or marking it sold."
            />
          )}

          <LookForm listingId={sheet.listingId} looking={sheet.looking} />

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
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={lotPath()} />}
            >
              Who set up
            </Button>
          </div>
        </div>
      </MallSection>
    </div>
  );
}
