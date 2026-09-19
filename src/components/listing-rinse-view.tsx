import Link from "next/link";

import { ListingRinseEmpty } from "@/components/listing-rinse-empty";
import { SyncRinse } from "@/components/listing-rinse-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  RINSE_LEAVE_LINE,
  RINSE_MIRROR_SCRIPT,
  RINSE_NOTICE_TITLE,
  RINSE_REFUSE_COPY,
  RINSE_SKIP_LINE,
  RINSE_STAYS_LINE,
  RINSE_STILL_LINE,
  RINSE_TABLE_LINE,
  RINSE_TOTE_LINE,
  RINSE_UNNAMED_LINE,
  RINSE_WALK_LINE,
} from "@/lib/listing-rinse";
import { listingPath, listingRinseWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type RinseViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

export type RinseViewSheet = {
  kind: RinseViewKind;
  listingId: string;
  isRinse: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function RinseMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={RINSE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
    />
  );
}

function RinseRefused({ sheet }: { sheet: RinseViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const mixtape = sheet.kind === "mixtape";
  const jewels = sheet.kind === "jewels";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-rinse-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : mixtape
                ? "A mixtape is not an LP"
                : jewels
                  ? "Empty jewels are not an LP"
                  : chair
                    ? "A chair is not an LP"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={RINSE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A rinse note is for the unnamed LP on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {RINSE_TABLE_LINE} {RINSE_SKIP_LINE} {RINSE_UNNAMED_LINE}{" "}
              {RINSE_STILL_LINE}
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

function RinseForm({
  listingId,
  isRinse,
}: {
  listingId: string;
  isRinse: boolean;
}) {
  return (
    <form
      method="post"
      action={listingRinseWritePath()}
      className="space-y-3"
      data-rinse-form={isRinse ? "open" : "rinse"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isRinse ? "open" : "rinse"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/rinse`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isRinse ? RINSE_LEAVE_LINE : RINSE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isRinse
          ? "Clear the tape. Status and the tote stay put."
          : `${RINSE_STAYS_LINE} ${RINSE_SKIP_LINE} ${RINSE_UNNAMED_LINE} ${RINSE_STILL_LINE} ${RINSE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingRinseView({
  sheet,
  rinseIds,
}: {
  sheet: RinseViewSheet;
  rinseIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <RinseMissing />;
  }

  if (sheet.kind !== "physical") {
    return <RinseRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-rinse-sheet="physical"
      data-rinse-state={sheet.isRinse ? "rinse" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: RINSE_MIRROR_SCRIPT }} />
      <SyncRinse listingIds={rinseIds} />

      <MallHero>
        <MallCrumb label="I will not rinse it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Rinse</span>
        </MallCrumb>

        <MallEyebrow>I will not rinse it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isRinse ? RINSE_NOTICE_TITLE : RINSE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {RINSE_TABLE_LINE} {RINSE_SKIP_LINE} {RINSE_UNNAMED_LINE}{" "}
            {RINSE_WALK_LINE} {RINSE_STAYS_LINE} {RINSE_STILL_LINE}{" "}
            {RINSE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-rinse-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isRinse ? (
              <Badge variant="outline">I will not rinse it</Badge>
            ) : (
              <Badge variant="ghost">Rinse not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Rinse paper
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
            {sheet.isRinse
              ? "Still for sale. Seller taped the rinse note. Status stays available. Not a wash shop."
              : "Still a skip. Still unnamed. Tape it when walkers still want the smear washed."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isRinse ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not rinse it"
              title={RINSE_NOTICE_TITLE}
              body={`${RINSE_STILL_LINE} avail=open still lists this LP.`}
            />
          ) : (
            <ListingRinseEmpty listingId={sheet.listingId} />
          )}

          <RinseForm listingId={sheet.listingId} isRinse={sheet.isRinse} />

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
