import Link from "next/link";

import { ListingBrewsterEmpty } from "@/components/listing-brewster-empty";
import { SyncBrewster } from "@/components/listing-brewster-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  BREWSTER_LEAVE_LINE,
  BREWSTER_LID_LINE,
  BREWSTER_MIRROR_SCRIPT,
  BREWSTER_NOTICE_TITLE,
  BREWSTER_POT_LINE,
  BREWSTER_REFUSE_COPY,
  BREWSTER_STAYS_LINE,
  BREWSTER_STILL_LINE,
  BREWSTER_TABLE_LINE,
  BREWSTER_TOTE_LINE,
  BREWSTER_WALK_LINE,
} from "@/lib/listing-brewster";
import { listingBrewsterWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type BrewsterViewKind =
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

export type BrewsterViewSheet = {
  kind: BrewsterViewKind;
  listingId: string;
  isBrewster: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function BrewsterMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={BREWSTER_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function BrewsterRefused({ sheet }: { sheet: BrewsterViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const mug = sheet.kind === "mug";
  const whisk = sheet.kind === "whisk";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-brewster-sheet={sheet.kind}>
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
        title={BREWSTER_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A brewster note is for the pot lid on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {BREWSTER_TABLE_LINE} {BREWSTER_LID_LINE} {BREWSTER_POT_LINE}{" "}
              {BREWSTER_STILL_LINE}
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

function BrewsterForm({
  listingId,
  isBrewster,
}: {
  listingId: string;
  isBrewster: boolean;
}) {
  return (
    <form
      method="post"
      action={listingBrewsterWritePath()}
      className="space-y-3"
      data-brewster-form={isBrewster ? "open" : "brewster"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isBrewster ? "open" : "brewster"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/brewster`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isBrewster ? BREWSTER_LEAVE_LINE : BREWSTER_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isBrewster
          ? "Clear the tape. Status and the tote stay put."
          : `${BREWSTER_STAYS_LINE} ${BREWSTER_LID_LINE} ${BREWSTER_POT_LINE} ${BREWSTER_STILL_LINE} ${BREWSTER_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingBrewsterView({
  sheet,
  brewsterIds,
}: {
  sheet: BrewsterViewSheet;
  brewsterIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <BrewsterMissing />;
  }

  if (sheet.kind !== "physical") {
    return <BrewsterRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-brewster-sheet="physical"
      data-brewster-state={sheet.isBrewster ? "brewster" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: BREWSTER_MIRROR_SCRIPT }} />
      <SyncBrewster listingIds={brewsterIds} />

      <MallHero>
        <MallCrumb label="I will not brewster it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Brewster</span>
        </MallCrumb>

        <MallEyebrow>I will not brewster it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isBrewster ? BREWSTER_NOTICE_TITLE : BREWSTER_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {BREWSTER_TABLE_LINE} {BREWSTER_LID_LINE} {BREWSTER_POT_LINE}{" "}
            {BREWSTER_WALK_LINE} {BREWSTER_STAYS_LINE} {BREWSTER_STILL_LINE}{" "}
            {BREWSTER_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-brewster-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isBrewster ? (
              <Badge variant="outline">I will not brewster it</Badge>
            ) : (
              <Badge variant="ghost">Brewster not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Brewster paper
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
            {sheet.isBrewster
              ? "Still for sale. Seller taped the brewster note. Status stays available. Not a shop."
              : "Still a lid. Still no pot. Tape it when walkers still want shop Brewster angle."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isBrewster ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not brewster it"
              title={BREWSTER_NOTICE_TITLE}
              body={`${BREWSTER_STILL_LINE} avail=open still lists this lid.`}
            />
          ) : (
            <ListingBrewsterEmpty listingId={sheet.listingId} />
          )}

          <BrewsterForm listingId={sheet.listingId} isBrewster={sheet.isBrewster} />

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
