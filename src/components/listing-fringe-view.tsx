import Link from "next/link";

import { ListingFringeEmpty } from "@/components/listing-fringe-empty";
import { SyncFringe } from "@/components/listing-fringe-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  FRINGE_LEAVE_LINE,
  FRINGE_LID_LINE,
  FRINGE_MIRROR_SCRIPT,
  FRINGE_NOTICE_TITLE,
  FRINGE_POT_LINE,
  FRINGE_REFUSE_COPY,
  FRINGE_STAYS_LINE,
  FRINGE_STILL_LINE,
  FRINGE_TABLE_LINE,
  FRINGE_TOTE_LINE,
  FRINGE_WALK_LINE,
} from "@/lib/listing-fringe";
import { listingFringeWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type FringeViewKind =
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

export type FringeViewSheet = {
  kind: FringeViewKind;
  listingId: string;
  isFringe: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function FringeMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={FRINGE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function FringeRefused({ sheet }: { sheet: FringeViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const mug = sheet.kind === "mug";
  const whisk = sheet.kind === "whisk";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-fringe-sheet={sheet.kind}>
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
        title={FRINGE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A fringe note is for the pot lid on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {FRINGE_TABLE_LINE} {FRINGE_LID_LINE} {FRINGE_POT_LINE}{" "}
              {FRINGE_STILL_LINE}
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

function FringeForm({
  listingId,
  isFringe,
}: {
  listingId: string;
  isFringe: boolean;
}) {
  return (
    <form
      method="post"
      action={listingFringeWritePath()}
      className="space-y-3"
      data-fringe-form={isFringe ? "open" : "fringe"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isFringe ? "open" : "fringe"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/fringe`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isFringe ? FRINGE_LEAVE_LINE : FRINGE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isFringe
          ? "Clear the tape. Status and the tote stay put."
          : `${FRINGE_STAYS_LINE} ${FRINGE_LID_LINE} ${FRINGE_POT_LINE} ${FRINGE_STILL_LINE} ${FRINGE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingFringeView({
  sheet,
  fringeIds,
}: {
  sheet: FringeViewSheet;
  fringeIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <FringeMissing />;
  }

  if (sheet.kind !== "physical") {
    return <FringeRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-fringe-sheet="physical"
      data-fringe-state={sheet.isFringe ? "fringe" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: FRINGE_MIRROR_SCRIPT }} />
      <SyncFringe listingIds={fringeIds} />

      <MallHero>
        <MallCrumb label="I will not fringe it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Fringe</span>
        </MallCrumb>

        <MallEyebrow>I will not fringe it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isFringe ? FRINGE_NOTICE_TITLE : FRINGE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {FRINGE_TABLE_LINE} {FRINGE_LID_LINE} {FRINGE_POT_LINE}{" "}
            {FRINGE_WALK_LINE} {FRINGE_STAYS_LINE} {FRINGE_STILL_LINE}{" "}
            {FRINGE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-fringe-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isFringe ? (
              <Badge variant="outline">I will not fringe it</Badge>
            ) : (
              <Badge variant="ghost">Fringe not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Fringe paper
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
            {sheet.isFringe
              ? "Still for sale. Seller taped the fringe note. Status stays available. Not a shop."
              : "Still a lid. Still no pot. Tape it when walkers still want shop light-bands."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isFringe ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not fringe it"
              title={FRINGE_NOTICE_TITLE}
              body={`${FRINGE_STILL_LINE} avail=open still lists this lid.`}
            />
          ) : (
            <ListingFringeEmpty listingId={sheet.listingId} />
          )}

          <FringeForm listingId={sheet.listingId} isFringe={sheet.isFringe} />

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
