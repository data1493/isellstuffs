import Link from "next/link";

import { ListingStiltEmpty } from "@/components/listing-stilt-empty";
import { SyncStilt } from "@/components/listing-stilt-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  STILT_COFFEE_LINE,
  STILT_LEAVE_LINE,
  STILT_MIRROR_SCRIPT,
  STILT_NOTICE_TITLE,
  STILT_REFUSE_COPY,
  STILT_RIM_LINE,
  STILT_STAYS_LINE,
  STILT_STILL_LINE,
  STILT_TABLE_LINE,
  STILT_TOTE_LINE,
  STILT_WALK_LINE,
} from "@/lib/listing-stilt";
import { listingPath, listingStiltWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type StiltViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "lid"
  | "whisk"
  | "chair"
  | "owned";

export type StiltViewSheet = {
  kind: StiltViewKind;
  listingId: string;
  isStilt: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function StiltMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={STILT_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function StiltRefused({ sheet }: { sheet: StiltViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const lid = sheet.kind === "lid";
  const whisk = sheet.kind === "whisk";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-stilt-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : lid
                ? "A lid is not a mug"
                : whisk
                  ? "A whisk is not a mug"
                  : chair
                    ? "A chair is not a mug"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={STILT_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A stilt note is for the diner mug on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {STILT_TABLE_LINE} {STILT_RIM_LINE} {STILT_COFFEE_LINE}{" "}
              {STILT_STILL_LINE}
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

function StiltForm({
  listingId,
  isStilt,
}: {
  listingId: string;
  isStilt: boolean;
}) {
  return (
    <form
      method="post"
      action={listingStiltWritePath()}
      className="space-y-3"
      data-stilt-form={isStilt ? "open" : "stilt"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isStilt ? "open" : "stilt"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/stilt`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isStilt ? STILT_LEAVE_LINE : STILT_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isStilt
          ? "Clear the tape. Status and the tote stay put."
          : `${STILT_STAYS_LINE} ${STILT_RIM_LINE} ${STILT_COFFEE_LINE} ${STILT_STILL_LINE} ${STILT_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingStiltView({
  sheet,
  stiltIds,
}: {
  sheet: StiltViewSheet;
  stiltIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <StiltMissing />;
  }

  if (sheet.kind !== "physical") {
    return <StiltRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-stilt-sheet="physical"
      data-stilt-state={sheet.isStilt ? "stilt" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: STILT_MIRROR_SCRIPT }} />
      <SyncStilt listingIds={stiltIds} />

      <MallHero>
        <MallCrumb label="I will not stilt it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Stilt</span>
        </MallCrumb>

        <MallEyebrow>I will not stilt it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isStilt ? STILT_NOTICE_TITLE : STILT_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {STILT_TABLE_LINE} {STILT_RIM_LINE} {STILT_COFFEE_LINE}{" "}
            {STILT_WALK_LINE} {STILT_STAYS_LINE} {STILT_STILL_LINE}{" "}
            {STILT_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-stilt-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isStilt ? (
              <Badge variant="outline">I will not stilt it</Badge>
            ) : (
              <Badge variant="ghost">Stilt not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Stilt paper
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
            {sheet.isStilt
              ? "Still for sale. Seller taped the stilt note. Status stays available. Not a shop."
              : "Still a diner rim. Still holds coffee. Tape it when walkers still want shop kiln stilts."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isStilt ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not stilt it"
              title={STILT_NOTICE_TITLE}
              body={`${STILT_STILL_LINE} avail=open still lists this mug.`}
            />
          ) : (
            <ListingStiltEmpty listingId={sheet.listingId} />
          )}

          <StiltForm listingId={sheet.listingId} isStilt={sheet.isStilt} />

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
