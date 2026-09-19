import Link from "next/link";

import { ListingPadEmpty } from "@/components/listing-pad-empty";
import { SyncPad } from "@/components/listing-pad-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  PAD_MIRROR_SCRIPT,
  PAD_NOTICE_TITLE,
  PAD_PAIR_LINE,
  PAD_PEEL_LINE,
  PAD_REFUSE_COPY,
  PAD_STAYS_LINE,
  PAD_STILL_LINE,
  PAD_TABLE_LINE,
  PAD_TOTE_LINE,
  PAD_WALK_LINE,
} from "@/lib/listing-pad";
import { listingPadWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type PadViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type PadViewSheet = {
  kind: PadViewKind;
  listingId: string;
  isPad: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function PadMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={PAD_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function PadRefused({ sheet }: { sheet: PadViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-pad-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={PAD_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A pad note is for a pair on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {PAD_TABLE_LINE} {PAD_PEEL_LINE} {PAD_STILL_LINE}
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

function PadForm({
  listingId,
  isPad,
}: {
  listingId: string;
  isPad: boolean;
}) {
  return (
    <form
      method="post"
      action={listingPadWritePath()}
      className="space-y-3"
      data-pad-form={isPad ? "open" : "pad"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isPad ? "open" : "pad"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/pad`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isPad ? "Leave the peel" : "I will not pad them"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isPad
          ? "Clear the tape. Status and the tote stay put."
          : `${PAD_STAYS_LINE} ${PAD_PEEL_LINE} ${PAD_PAIR_LINE} ${PAD_STILL_LINE} ${PAD_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingPadView({
  sheet,
  padIds,
}: {
  sheet: PadViewSheet;
  padIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <PadMissing />;
  }

  if (sheet.kind !== "physical") {
    return <PadRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-pad-sheet="physical"
      data-pad-state={sheet.isPad ? "pad" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: PAD_MIRROR_SCRIPT }} />
      <SyncPad listingIds={padIds} />

      <MallHero>
        <MallCrumb label="I will not pad them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Pad</span>
        </MallCrumb>

        <MallEyebrow>I will not pad them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isPad ? PAD_NOTICE_TITLE : PAD_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {PAD_TABLE_LINE} {PAD_PEEL_LINE} {PAD_WALK_LINE}{" "}
            {PAD_STAYS_LINE} {PAD_STILL_LINE} {PAD_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-pad-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isPad ? (
              <Badge variant="outline">I will not pad them</Badge>
            ) : (
              <Badge variant="ghost">Pad not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Pad paper
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
            {sheet.isPad
              ? "Still for sale. Seller taped the pad note. Status stays available. Not a cobbler."
              : "Peel stays. Still a pair. Tape it when walkers still want pads thrown in."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isPad ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not pad them"
              title={PAD_NOTICE_TITLE}
              body={`${PAD_STILL_LINE} avail=open still lists this pair.`}
            />
          ) : (
            <ListingPadEmpty listingId={sheet.listingId} />
          )}

          <PadForm listingId={sheet.listingId} isPad={sheet.isPad} />

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
