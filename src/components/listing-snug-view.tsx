import Link from "next/link";

import { ListingSnugEmpty } from "@/components/listing-snug-empty";
import { SyncSnug } from "@/components/listing-snug-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  SNUG_LEAVE_LINE,
  SNUG_LID_LINE,
  SNUG_MIRROR_SCRIPT,
  SNUG_NOTICE_TITLE,
  SNUG_REFUSE_COPY,
  SNUG_STAYS_LINE,
  SNUG_STILL_LINE,
  SNUG_TABLE_LINE,
  SNUG_TOTE_LINE,
  SNUG_WALK_LINE,
  SNUG_WIGGLE_LINE,
} from "@/lib/listing-snug";
import { listingPath, listingSnugWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type SnugViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "mug"
  | "whisk"
  | "chair"
  | "owned";

export type SnugViewSheet = {
  kind: SnugViewKind;
  listingId: string;
  isSnug: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function SnugMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={SNUG_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function SnugRefused({ sheet }: { sheet: SnugViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const mug = sheet.kind === "mug";
  const whisk = sheet.kind === "whisk";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-snug-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : mug
                ? "A mug is not a lid"
                : whisk
                  ? "A whisk is not a lid"
                  : chair
                    ? "A chair is not a lid"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={SNUG_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A snug note is for the pot lid on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {SNUG_TABLE_LINE} {SNUG_WIGGLE_LINE} {SNUG_LID_LINE}{" "}
              {SNUG_STILL_LINE}
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

function SnugForm({
  listingId,
  isSnug,
}: {
  listingId: string;
  isSnug: boolean;
}) {
  return (
    <form
      method="post"
      action={listingSnugWritePath()}
      className="space-y-3"
      data-snug-form={isSnug ? "open" : "snug"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isSnug ? "open" : "snug"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/snug`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isSnug ? SNUG_LEAVE_LINE : SNUG_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isSnug
          ? "Clear the tape. Status and the tote stay put."
          : `${SNUG_STAYS_LINE} ${SNUG_WIGGLE_LINE} ${SNUG_LID_LINE} ${SNUG_STILL_LINE} ${SNUG_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingSnugView({
  sheet,
  snugIds,
}: {
  sheet: SnugViewSheet;
  snugIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <SnugMissing />;
  }

  if (sheet.kind !== "physical") {
    return <SnugRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-snug-sheet="physical"
      data-snug-state={sheet.isSnug ? "snug" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: SNUG_MIRROR_SCRIPT }} />
      <SyncSnug listingIds={snugIds} />

      <MallHero>
        <MallCrumb label="I will not snug it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Snug</span>
        </MallCrumb>

        <MallEyebrow>I will not snug it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isSnug ? SNUG_NOTICE_TITLE : SNUG_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SNUG_TABLE_LINE} {SNUG_WIGGLE_LINE} {SNUG_LID_LINE}{" "}
            {SNUG_WALK_LINE} {SNUG_STAYS_LINE} {SNUG_STILL_LINE}{" "}
            {SNUG_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-snug-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isSnug ? (
              <Badge variant="outline">I will not snug it</Badge>
            ) : (
              <Badge variant="ghost">Snug not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Snug paper
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
            {sheet.isSnug
              ? "Still for sale. Seller taped the snug note. Status stays available. Not a shop."
              : "Still a wiggle. Still a lid. Tape it when walkers still want a shop finger-tight."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isSnug ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not snug it"
              title={SNUG_NOTICE_TITLE}
              body={`${SNUG_STILL_LINE} avail=open still lists this lid.`}
            />
          ) : (
            <ListingSnugEmpty listingId={sheet.listingId} />
          )}

          <SnugForm listingId={sheet.listingId} isSnug={sheet.isSnug} />

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
