import Link from "next/link";

import { ListingHickeyEmpty } from "@/components/listing-hickey-empty";
import { SyncHickey } from "@/components/listing-hickey-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  HICKEY_LEAVE_LINE,
  HICKEY_MIRROR_SCRIPT,
  HICKEY_NOTICE_TITLE,
  HICKEY_REFUSE_COPY,
  HICKEY_SHADE_LINE,
  HICKEY_STAYS_LINE,
  HICKEY_STILL_LINE,
  HICKEY_TABLE_LINE,
  HICKEY_TOTE_LINE,
  HICKEY_WALK_LINE,
  HICKEY_WIGGLE_LINE,
} from "@/lib/listing-hickey";
import { listingHickeyWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type HickeyViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "chair"
  | "mug"
  | "owned";

export type HickeyViewSheet = {
  kind: HickeyViewKind;
  listingId: string;
  isHickey: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function HickeyMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={HICKEY_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function HickeyRefused({ sheet }: { sheet: HickeyViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const chair = sheet.kind === "chair";
  const mug = sheet.kind === "mug";
  const owned = sheet.kind === "owned";

  return (
    <div data-hickey-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : chair
                ? "A chair is not a pipe"
                : mug
                  ? "A mug is not a pipe"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={HICKEY_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A hickey note is for the wobbly lamp on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {HICKEY_TABLE_LINE} {HICKEY_WIGGLE_LINE} {HICKEY_SHADE_LINE}{" "}
              {HICKEY_STILL_LINE}
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

function HickeyForm({
  listingId,
  isHickey,
}: {
  listingId: string;
  isHickey: boolean;
}) {
  return (
    <form
      method="post"
      action={listingHickeyWritePath()}
      className="space-y-3"
      data-hickey-form={isHickey ? "open" : "hickey"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isHickey ? "open" : "hickey"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/hickey`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isHickey ? HICKEY_LEAVE_LINE : HICKEY_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isHickey
          ? "Clear the tape. Status and the tote stay put."
          : `${HICKEY_STAYS_LINE} ${HICKEY_WIGGLE_LINE} ${HICKEY_SHADE_LINE} ${HICKEY_STILL_LINE} ${HICKEY_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingHickeyView({
  sheet,
  hickeyIds,
}: {
  sheet: HickeyViewSheet;
  hickeyIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <HickeyMissing />;
  }

  if (sheet.kind !== "physical") {
    return <HickeyRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-hickey-sheet="physical"
      data-hickey-state={sheet.isHickey ? "hickey" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: HICKEY_MIRROR_SCRIPT }} />
      <SyncHickey listingIds={hickeyIds} />

      <MallHero>
        <MallCrumb label="I will not hickey it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Hickey</span>
        </MallCrumb>

        <MallEyebrow>I will not hickey it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isHickey ? HICKEY_NOTICE_TITLE : HICKEY_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {HICKEY_TABLE_LINE} {HICKEY_WIGGLE_LINE} {HICKEY_SHADE_LINE} {HICKEY_WALK_LINE}{" "}
            {HICKEY_STAYS_LINE} {HICKEY_STILL_LINE} {HICKEY_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-hickey-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isHickey ? (
              <Badge variant="outline">I will not hickey it</Badge>
            ) : (
              <Badge variant="ghost">Hickey not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Hickey paper
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
            {sheet.isHickey
              ? "Still for sale. Seller taped the hickey note. Status stays available. Not a shop."
              : "Still a wiggle. Still shade optional. Tape it when walkers still want a shop pipe."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isHickey ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not hickey it"
              title={HICKEY_NOTICE_TITLE}
              body={`${HICKEY_STILL_LINE} avail=open still lists this lamp.`}
            />
          ) : (
            <ListingHickeyEmpty listingId={sheet.listingId} />
          )}

          <HickeyForm listingId={sheet.listingId} isHickey={sheet.isHickey} />

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
