import Link from "next/link";

import { ListingPogoEmpty } from "@/components/listing-pogo-empty";
import { SyncPogo } from "@/components/listing-pogo-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  POGO_CART_LINE,
  POGO_LEAVE_LINE,
  POGO_MIRROR_SCRIPT,
  POGO_NOTICE_TITLE,
  POGO_REFUSE_COPY,
  POGO_STAYS_LINE,
  POGO_STILL_LINE,
  POGO_TABLE_LINE,
  POGO_TETRIS_LINE,
  POGO_TOTE_LINE,
  POGO_WALK_LINE,
} from "@/lib/listing-pogo";
import { listingPath, listingPogoWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type PogoViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "drawer"
  | "disc"
  | "owned";

export type PogoViewSheet = {
  kind: PogoViewKind;
  listingId: string;
  isPogo: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function PogoMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={POGO_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function PogoRefused({ sheet }: { sheet: PogoViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const drawer = sheet.kind === "drawer";
  const disc = sheet.kind === "disc";
  const owned = sheet.kind === "owned";

  return (
    <div data-pogo-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : drawer
                ? "A drawer is not a pogo"
                : disc
                  ? "A disc is not a pogo"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={POGO_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A pogo note is for the cracked Game Boy on the table, not a LUT and not a gift code."
              )}
            </p>
            <p>
              {POGO_TABLE_LINE} {POGO_CART_LINE} {POGO_TETRIS_LINE}{" "}
              {POGO_STILL_LINE}
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

function PogoForm({
  listingId,
  isPogo,
}: {
  listingId: string;
  isPogo: boolean;
}) {
  return (
    <form
      method="post"
      action={listingPogoWritePath()}
      className="space-y-3"
      data-pogo-form={isPogo ? "open" : "pogo"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isPogo ? "open" : "pogo"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/pogo`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isPogo ? POGO_LEAVE_LINE : POGO_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isPogo
          ? "Clear the tape. Status and the tote stay put."
          : `${POGO_STAYS_LINE} ${POGO_CART_LINE} ${POGO_TETRIS_LINE} ${POGO_STILL_LINE} ${POGO_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingPogoView({
  sheet,
  pogoIds,
}: {
  sheet: PogoViewSheet;
  pogoIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <PogoMissing />;
  }

  if (sheet.kind !== "physical") {
    return <PogoRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-pogo-sheet="physical"
      data-pogo-state={sheet.isPogo ? "pogo" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: POGO_MIRROR_SCRIPT }} />
      <SyncPogo listingIds={pogoIds} />

      <MallHero>
        <MallCrumb label="I will not pogo it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Pogo</span>
        </MallCrumb>

        <MallEyebrow>I will not pogo it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isPogo ? POGO_NOTICE_TITLE : POGO_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {POGO_TABLE_LINE} {POGO_CART_LINE} {POGO_TETRIS_LINE}{" "}
            {POGO_WALK_LINE} {POGO_STAYS_LINE} {POGO_STILL_LINE}{" "}
            {POGO_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-pogo-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isPogo ? (
              <Badge variant="outline">I will not pogo it</Badge>
            ) : (
              <Badge variant="ghost">Pogo not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Pogo paper
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
            {sheet.isPogo
              ? "Still for sale. Seller taped the pogo note. Status stays available. Not a shop spring."
              : "Still a cart. Still Tetris. Tape it when walkers still want the fused cart sprung."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isPogo ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not pogo it"
              title={POGO_NOTICE_TITLE}
              body={`${POGO_STILL_LINE} avail=open still lists this Game Boy.`}
            />
          ) : (
            <ListingPogoEmpty listingId={sheet.listingId} />
          )}

          <PogoForm listingId={sheet.listingId} isPogo={sheet.isPogo} />

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
