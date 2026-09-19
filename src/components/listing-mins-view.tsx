import Link from "next/link";

import { ListingMinsEmpty } from "@/components/listing-mins-empty";
import { SyncMins } from "@/components/listing-mins-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  MINS_CARDS_LINE,
  MINS_MINUTES_LINE,
  MINS_MIRROR_SCRIPT,
  MINS_NOTICE_TITLE,
  MINS_REFUSE_COPY,
  MINS_STILL_LINE,
  MINS_TOTE_LINE,
  MINS_VIBE_LINE,
  MINS_WALK_LINE,
} from "@/lib/listing-mins";
import { listingMinsWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type MinsViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type MinsViewSheet = {
  kind: MinsViewKind;
  listingId: string;
  isMins: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function MinsMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={MINS_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function MinsRefused({ sheet }: { sheet: MinsViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-mins-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={MINS_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "I will not time it is for a file on the digital lot, not a mug and not a gift code."
              )}
            </p>
            <p>
              {MINS_NOTICE_TITLE} {MINS_VIBE_LINE} {MINS_CARDS_LINE}{" "}
              {MINS_WALK_LINE} {MINS_STILL_LINE}
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

function MinsForm({
  listingId,
  isMins,
}: {
  listingId: string;
  isMins: boolean;
}) {
  return (
    <form
      method="post"
      action={listingMinsWritePath()}
      className="space-y-3"
      data-mins-form={isMins ? "open" : "mins"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isMins ? "open" : "mins"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/mins`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isMins ? "Leave the vibes" : "I will not time it"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isMins
          ? "Clear the minutes paper. Status and the tote stay put."
          : `${MINS_MINUTES_LINE} ${MINS_VIBE_LINE} ${MINS_CARDS_LINE} ${MINS_WALK_LINE} ${MINS_STILL_LINE} ${MINS_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingMinsView({
  sheet,
  minsIds,
}: {
  sheet: MinsViewSheet;
  minsIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <MinsMissing />;
  }

  if (sheet.kind !== "digital") {
    return <MinsRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-mins-sheet="digital"
      data-mins-state={sheet.isMins ? "mins" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: MINS_MIRROR_SCRIPT }} />
      <SyncMins listingIds={minsIds} />

      <MallHero>
        <MallCrumb label="I will not time it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Mins</span>
        </MallCrumb>

        <MallEyebrow>I will not time it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isMins ? MINS_NOTICE_TITLE : "I will not time it."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {MINS_NOTICE_TITLE} {MINS_VIBE_LINE} {MINS_CARDS_LINE}{" "}
            {MINS_WALK_LINE} {MINS_STILL_LINE} {MINS_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-mins-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isMins ? (
              <Badge variant="outline">No minutes</Badge>
            ) : (
              <Badge variant="ghost">Open to minutes</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Minutes paper
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
            {sheet.isMins
              ? "Still for sale. Seller taped that the cards stay untimed. Walkers still ask Sink Drawer how long. Status stays available."
              : "No minutes. Tape it when walkers still want a timer on the cards."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isMins ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not time it"
              title={MINS_NOTICE_TITLE}
              body={`${MINS_STILL_LINE} avail=open still lists this file. ${MINS_MINUTES_LINE}`}
            />
          ) : (
            <ListingMinsEmpty listingId={sheet.listingId} />
          )}

          <MinsForm listingId={sheet.listingId} isMins={sheet.isMins} />

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
