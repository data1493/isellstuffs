import Link from "next/link";

import { ListingUpsetEmpty } from "@/components/listing-upset-empty";
import { SyncUpset } from "@/components/listing-upset-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  UPSET_BENT_LINE,
  UPSET_LEAVE_LINE,
  UPSET_METAL_LINE,
  UPSET_MIRROR_SCRIPT,
  UPSET_NOTICE_TITLE,
  UPSET_REFUSE_COPY,
  UPSET_STAYS_LINE,
  UPSET_STILL_LINE,
  UPSET_TABLE_LINE,
  UPSET_TOTE_LINE,
  UPSET_WALK_LINE,
} from "@/lib/listing-upset";
import { listingPath, listingUpsetWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type UpsetViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "mug"
  | "lid"
  | "chair"
  | "owned";

export type UpsetViewSheet = {
  kind: UpsetViewKind;
  listingId: string;
  isUpset: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function UpsetMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={UPSET_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function UpsetRefused({ sheet }: { sheet: UpsetViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const mug = sheet.kind === "mug";
  const lid = sheet.kind === "lid";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-upset-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : mug
                ? "A mug is not an upset"
                : lid
                  ? "A lid is not an upset"
                  : chair
                    ? "A chair is not a whisk"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={UPSET_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "An upset note is for the balloon whisk on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {UPSET_TABLE_LINE} {UPSET_BENT_LINE} {UPSET_METAL_LINE}{" "}
              {UPSET_STILL_LINE}
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

function UpsetForm({
  listingId,
  isUpset,
}: {
  listingId: string;
  isUpset: boolean;
}) {
  return (
    <form
      method="post"
      action={listingUpsetWritePath()}
      className="space-y-3"
      data-upset-form={isUpset ? "open" : "upset"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isUpset ? "open" : "upset"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/upset`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isUpset ? UPSET_LEAVE_LINE : UPSET_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isUpset
          ? "Clear the tape. Status and the tote stay put."
          : `${UPSET_STAYS_LINE} ${UPSET_BENT_LINE} ${UPSET_METAL_LINE} ${UPSET_STILL_LINE} ${UPSET_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingUpsetView({
  sheet,
  upsetIds,
}: {
  sheet: UpsetViewSheet;
  upsetIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <UpsetMissing />;
  }

  if (sheet.kind !== "physical") {
    return <UpsetRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-upset-sheet="physical"
      data-upset-state={sheet.isUpset ? "upset" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: UPSET_MIRROR_SCRIPT }} />
      <SyncUpset listingIds={upsetIds} />

      <MallHero>
        <MallCrumb label="I will not upset it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Upset</span>
        </MallCrumb>

        <MallEyebrow>I will not upset it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isUpset ? UPSET_NOTICE_TITLE : UPSET_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {UPSET_TABLE_LINE} {UPSET_BENT_LINE} {UPSET_METAL_LINE}{" "}
            {UPSET_WALK_LINE} {UPSET_STAYS_LINE} {UPSET_STILL_LINE}{" "}
            {UPSET_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-upset-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isUpset ? (
              <Badge variant="outline">I will not upset it</Badge>
            ) : (
              <Badge variant="ghost">Upset not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Upset paper
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
            {sheet.isUpset
              ? "Still for sale. Seller taped the upset note. Status stays available. Not a shop thicken."
              : "Still bent. Still metal. Tape it when walkers still want the wire ends thickened."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isUpset ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not upset it"
              title={UPSET_NOTICE_TITLE}
              body={`${UPSET_STILL_LINE} avail=open still lists this whisk.`}
            />
          ) : (
            <ListingUpsetEmpty listingId={sheet.listingId} />
          )}

          <UpsetForm listingId={sheet.listingId} isUpset={sheet.isUpset} />

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
