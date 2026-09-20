import Link from "next/link";

import { ListingBlackpadEmpty } from "@/components/listing-blackpad-empty";
import { SyncBlackpad } from "@/components/listing-blackpad-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  BLACKPAD_CRACK_LINE,
  BLACKPAD_LEAVE_LINE,
  BLACKPAD_MIRROR_SCRIPT,
  BLACKPAD_NOTICE_TITLE,
  BLACKPAD_REFUSE_COPY,
  BLACKPAD_STAYS_LINE,
  BLACKPAD_STILL_LINE,
  BLACKPAD_TABLE_LINE,
  BLACKPAD_TETRIS_LINE,
  BLACKPAD_TOTE_LINE,
  BLACKPAD_WALK_LINE,
} from "@/lib/listing-blackpad";
import { listingBlackpadWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type BlackpadViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "drawer"
  | "lid"
  | "owned";

export type BlackpadViewSheet = {
  kind: BlackpadViewKind;
  listingId: string;
  isBlackpad: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function BlackpadMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={BLACKPAD_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function BlackpadRefused({ sheet }: { sheet: BlackpadViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const drawer = sheet.kind === "drawer";
  const lid = sheet.kind === "lid";
  const owned = sheet.kind === "owned";

  return (
    <div data-blackpad-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : drawer
                ? "A drawer is not a blackpad"
                : lid
                  ? "A lid is not a blackpad"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={BLACKPAD_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A blackpad note is for the cracked Game Boy on the table, not a LUT and not a gift code."
              )}
            </p>
            <p>
              {BLACKPAD_TABLE_LINE} {BLACKPAD_CRACK_LINE} {BLACKPAD_TETRIS_LINE}{" "}
              {BLACKPAD_STILL_LINE}
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

function BlackpadForm({
  listingId,
  isBlackpad,
}: {
  listingId: string;
  isBlackpad: boolean;
}) {
  return (
    <form
      method="post"
      action={listingBlackpadWritePath()}
      className="space-y-3"
      data-blackpad-form={isBlackpad ? "open" : "blackpad"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isBlackpad ? "open" : "blackpad"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/blackpad`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isBlackpad ? BLACKPAD_LEAVE_LINE : BLACKPAD_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isBlackpad
          ? "Clear the tape. Status and the tote stay put."
          : `${BLACKPAD_STAYS_LINE} ${BLACKPAD_CRACK_LINE} ${BLACKPAD_TETRIS_LINE} ${BLACKPAD_STILL_LINE} ${BLACKPAD_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingBlackpadView({
  sheet,
  blackpadIds,
}: {
  sheet: BlackpadViewSheet;
  blackpadIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <BlackpadMissing />;
  }

  if (sheet.kind !== "physical") {
    return <BlackpadRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-blackpad-sheet="physical"
      data-blackpad-state={sheet.isBlackpad ? "blackpad" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: BLACKPAD_MIRROR_SCRIPT }} />
      <SyncBlackpad listingIds={blackpadIds} />

      <MallHero>
        <MallCrumb label="I will not blackpad it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Blackpad</span>
        </MallCrumb>

        <MallEyebrow>I will not blackpad it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isBlackpad ? BLACKPAD_NOTICE_TITLE : BLACKPAD_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {BLACKPAD_TABLE_LINE} {BLACKPAD_CRACK_LINE} {BLACKPAD_TETRIS_LINE}{" "}
            {BLACKPAD_WALK_LINE} {BLACKPAD_STAYS_LINE} {BLACKPAD_STILL_LINE}{" "}
            {BLACKPAD_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-blackpad-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isBlackpad ? (
              <Badge variant="outline">I will not blackpad it</Badge>
            ) : (
              <Badge variant="ghost">Blackpad not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Blackpad paper
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
            {sheet.isBlackpad
              ? "Still for sale. Seller taped the blackpad note. Status stays available. Not a shop."
              : "Still a crack. Still Tetris. Tape it when walkers still want the pads shop-blackpadded."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isBlackpad ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not blackpad it"
              title={BLACKPAD_NOTICE_TITLE}
              body={`${BLACKPAD_STILL_LINE} avail=open still lists this Game Boy.`}
            />
          ) : (
            <ListingBlackpadEmpty listingId={sheet.listingId} />
          )}

          <BlackpadForm listingId={sheet.listingId} isBlackpad={sheet.isBlackpad} />

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
