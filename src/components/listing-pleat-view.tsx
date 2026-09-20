import Link from "next/link";

import { ListingPleatEmpty } from "@/components/listing-pleat-empty";
import { SyncPleat } from "@/components/listing-pleat-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  PLEAT_HOLE_LINE,
  PLEAT_JACKET_LINE,
  PLEAT_LEAVE_LINE,
  PLEAT_MIRROR_SCRIPT,
  PLEAT_NOTICE_TITLE,
  PLEAT_REFUSE_COPY,
  PLEAT_STAYS_LINE,
  PLEAT_STILL_LINE,
  PLEAT_TABLE_LINE,
  PLEAT_TOTE_LINE,
  PLEAT_WALK_LINE,
} from "@/lib/listing-pleat";
import { listingPath, listingPleatWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type PleatViewKind =
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

export type PleatViewSheet = {
  kind: PleatViewKind;
  listingId: string;
  isPleat: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function PleatMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={PLEAT_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function PleatRefused({ sheet }: { sheet: PleatViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const sneakers = sheet.kind === "sneakers";
  const lamp = sheet.kind === "lamp";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-pleat-sheet={sheet.kind}>
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
        title={PLEAT_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A pleat note is for the windbreaker on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {PLEAT_TABLE_LINE} {PLEAT_JACKET_LINE} {PLEAT_HOLE_LINE}{" "}
              {PLEAT_STILL_LINE}
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

function PleatForm({
  listingId,
  isPleat,
}: {
  listingId: string;
  isPleat: boolean;
}) {
  return (
    <form
      method="post"
      action={listingPleatWritePath()}
      className="space-y-3"
      data-pleat-form={isPleat ? "open" : "pleat"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isPleat ? "open" : "pleat"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/pleat`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isPleat ? PLEAT_LEAVE_LINE : PLEAT_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isPleat
          ? "Clear the tape. Status and the tote stay put."
          : `${PLEAT_STAYS_LINE} ${PLEAT_JACKET_LINE} ${PLEAT_HOLE_LINE} ${PLEAT_STILL_LINE} ${PLEAT_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingPleatView({
  sheet,
  pleatIds,
}: {
  sheet: PleatViewSheet;
  pleatIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <PleatMissing />;
  }

  if (sheet.kind !== "physical") {
    return <PleatRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-pleat-sheet="physical"
      data-pleat-state={sheet.isPleat ? "pleat" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: PLEAT_MIRROR_SCRIPT }} />
      <SyncPleat listingIds={pleatIds} />

      <MallHero>
        <MallCrumb label="I will not pleat it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Pleat</span>
        </MallCrumb>

        <MallEyebrow>I will not pleat it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isPleat ? PLEAT_NOTICE_TITLE : PLEAT_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {PLEAT_TABLE_LINE} {PLEAT_JACKET_LINE} {PLEAT_HOLE_LINE}{" "}
            {PLEAT_WALK_LINE} {PLEAT_STAYS_LINE} {PLEAT_STILL_LINE}{" "}
            {PLEAT_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-pleat-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isPleat ? (
              <Badge variant="outline">I will not pleat it</Badge>
            ) : (
              <Badge variant="ghost">Pleat not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Pleat paper
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
            {sheet.isPleat
              ? "Still for sale. Seller taped the pleat note. Status stays available. Not a tailor."
              : "Still a jacket. Still a hole. Tape it when walkers still want the front folded."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isPleat ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not pleat it"
              title={PLEAT_NOTICE_TITLE}
              body={`${PLEAT_STILL_LINE} avail=open still lists this jacket.`}
            />
          ) : (
            <ListingPleatEmpty listingId={sheet.listingId} />
          )}

          <PleatForm listingId={sheet.listingId} isPleat={sheet.isPleat} />

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
