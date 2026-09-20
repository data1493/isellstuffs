import Link from "next/link";

import { ListingPinkEmpty } from "@/components/listing-pink-empty";
import { SyncPink } from "@/components/listing-pink-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  PINK_CAR_LINE,
  PINK_LEAVE_LINE,
  PINK_MINT_LINE,
  PINK_MIRROR_SCRIPT,
  PINK_NOTICE_TITLE,
  PINK_REFUSE_COPY,
  PINK_STAYS_LINE,
  PINK_STILL_LINE,
  PINK_TABLE_LINE,
  PINK_TOTE_LINE,
  PINK_WALK_LINE,
} from "@/lib/listing-pink";
import { listingPath, listingPinkWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type PinkViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "sneakers"
  | "lamp"
  | "chair"
  | "owned";

export type PinkViewSheet = {
  kind: PinkViewKind;
  listingId: string;
  isPink: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function PinkMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={PINK_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function PinkRefused({ sheet }: { sheet: PinkViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const sneakers = sheet.kind === "sneakers";
  const lamp = sheet.kind === "lamp";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-pink-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : sneakers
                ? "Sneakers stay on stitch"
                : lamp
                  ? "A lamp is not a jacket"
                  : chair
                    ? "A chair is not a jacket"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={PINK_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A pink note is for the windbreaker on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {PINK_TABLE_LINE} {PINK_MINT_LINE} {PINK_CAR_LINE}{" "}
              {PINK_STILL_LINE}
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

function PinkForm({
  listingId,
  isPink,
}: {
  listingId: string;
  isPink: boolean;
}) {
  return (
    <form
      method="post"
      action={listingPinkWritePath()}
      className="space-y-3"
      data-pink-form={isPink ? "open" : "pink"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isPink ? "open" : "pink"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/pink`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isPink ? PINK_LEAVE_LINE : PINK_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isPink
          ? "Clear the tape. Status and the tote stay put."
          : `${PINK_STAYS_LINE} ${PINK_MINT_LINE} ${PINK_CAR_LINE} ${PINK_STILL_LINE} ${PINK_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingPinkView({
  sheet,
  pinkIds,
}: {
  sheet: PinkViewSheet;
  pinkIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <PinkMissing />;
  }

  if (sheet.kind !== "physical") {
    return <PinkRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-pink-sheet="physical"
      data-pink-state={sheet.isPink ? "pink" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: PINK_MIRROR_SCRIPT }} />
      <SyncPink listingIds={pinkIds} />

      <MallHero>
        <MallCrumb label="I will not pink it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Pink</span>
        </MallCrumb>

        <MallEyebrow>I will not pink it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isPink ? PINK_NOTICE_TITLE : PINK_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {PINK_TABLE_LINE} {PINK_MINT_LINE} {PINK_CAR_LINE}{" "}
            {PINK_WALK_LINE} {PINK_STAYS_LINE} {PINK_STILL_LINE}{" "}
            {PINK_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-pink-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isPink ? (
              <Badge variant="outline">I will not pink it</Badge>
            ) : (
              <Badge variant="ghost">Pink not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Pink paper
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
            {sheet.isPink
              ? "Still for sale. Seller taped the pink note. Status stays available. Not a tailor."
              : "Still mint. Still a car. Tape it when walkers still want the raw hem zigzagged."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isPink ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not pink it"
              title={PINK_NOTICE_TITLE}
              body={`${PINK_STILL_LINE} avail=open still lists this jacket.`}
            />
          ) : (
            <ListingPinkEmpty listingId={sheet.listingId} />
          )}

          <PinkForm listingId={sheet.listingId} isPink={sheet.isPink} />

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
