import Link from "next/link";

import { ListingDoubleEmpty } from "@/components/listing-double-empty";
import { SyncDouble } from "@/components/listing-double-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  DOUBLE_CARDS_LINE,
  DOUBLE_CLIP_LINE,
  DOUBLE_MIRROR_SCRIPT,
  DOUBLE_NOTICE_TITLE,
  DOUBLE_REFUSE_COPY,
  DOUBLE_STILL_LINE,
  DOUBLE_TOTE_LINE,
  DOUBLE_VIBE_LINE,
} from "@/lib/listing-double";
import { listingDoubleWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type DoubleViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type DoubleViewSheet = {
  kind: DoubleViewKind;
  listingId: string;
  isDouble: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function DoubleMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={DOUBLE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function DoubleRefused({ sheet }: { sheet: DoubleViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-double-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={DOUBLE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Double honesty is for a scanned stack on the digital lot, not a mug and not a gift code."
              )}
            </p>
            <p>
              {DOUBLE_NOTICE_TITLE} {DOUBLE_VIBE_LINE} {DOUBLE_STILL_LINE}
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

function DoubleForm({
  listingId,
  isDouble,
}: {
  listingId: string;
  isDouble: boolean;
}) {
  return (
    <form
      method="post"
      action={listingDoubleWritePath()}
      className="space-y-3"
      data-double-form={isDouble ? "open" : "double"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isDouble ? "open" : "double"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/double`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isDouble ? "Leave the three cards" : "I will not double it"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isDouble
          ? "Clear the double paper. Status and the tote stay put."
          : `${DOUBLE_CARDS_LINE} ${DOUBLE_VIBE_LINE} ${DOUBLE_CLIP_LINE} ${DOUBLE_STILL_LINE} ${DOUBLE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingDoubleView({
  sheet,
  doubleIds,
}: {
  sheet: DoubleViewSheet;
  doubleIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <DoubleMissing />;
  }

  if (sheet.kind !== "digital") {
    return <DoubleRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-double-sheet="digital"
      data-double-state={sheet.isDouble ? "double" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: DOUBLE_MIRROR_SCRIPT }} />
      <SyncDouble listingIds={doubleIds} />

      <MallHero>
        <MallCrumb label="I will not double it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Double</span>
        </MallCrumb>

        <MallEyebrow>I will not double it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isDouble ? DOUBLE_NOTICE_TITLE : "Three cards. Vibes."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {DOUBLE_NOTICE_TITLE} {DOUBLE_VIBE_LINE} {DOUBLE_CLIP_LINE}{" "}
            {DOUBLE_STILL_LINE} {DOUBLE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-double-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isDouble ? (
              <Badge variant="outline">I will not double it</Badge>
            ) : (
              <Badge variant="ghost">Three cards still three</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Double paper
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
            {sheet.isDouble
              ? "Still for sale. Seller taped that the three cards stay three. Walkers still ask Sink Drawer to scale them. Status stays available."
              : "I will not double it. Tape it when walkers still want the cards scaled for a crowd."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isDouble ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not double it"
              title={DOUBLE_NOTICE_TITLE}
              body={`${DOUBLE_STILL_LINE} avail=open still lists this file. ${DOUBLE_CARDS_LINE}`}
            />
          ) : (
            <ListingDoubleEmpty listingId={sheet.listingId} />
          )}

          <DoubleForm listingId={sheet.listingId} isDouble={sheet.isDouble} />

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
