import Link from "next/link";

import { ListingSubsetEmpty } from "@/components/listing-subset-empty";
import { SyncSubset } from "@/components/listing-subset-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  SUBSET_LEAVE_LINE,
  SUBSET_MIRROR_SCRIPT,
  SUBSET_NOTICE_TITLE,
  SUBSET_OTF_LINE,
  SUBSET_REFUSE_COPY,
  SUBSET_STAYS_LINE,
  SUBSET_STILL_LINE,
  SUBSET_TABLE_LINE,
  SUBSET_TOTE_LINE,
  SUBSET_WALK_LINE,
  SUBSET_WEIGHTS_LINE,
} from "@/lib/listing-subset";
import { listingPath, listingSubsetWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type SubsetViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "lut"
  | "owned"
  | "missing";

export type SubsetViewSheet = {
  kind: SubsetViewKind;
  listingId: string;
  isSubset: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function SubsetMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={SUBSET_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function SubsetRefused({ sheet }: { sheet: SubsetViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const file = sheet.kind === "pack" || sheet.kind === "lut" || sheet.kind === "owned";

  return (
    <div data-subset-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Download stall"
              : object
                ? "On the table"
                : "Walked"
        }
        title={SUBSET_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A subset note is for the booth font, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {SUBSET_TABLE_LINE} {SUBSET_WEIGHTS_LINE} {SUBSET_OTF_LINE}{" "}
              {SUBSET_STILL_LINE}
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

function SubsetForm({
  listingId,
  isSubset,
}: {
  listingId: string;
  isSubset: boolean;
}) {
  return (
    <form
      method="post"
      action={listingSubsetWritePath()}
      className="space-y-3"
      data-subset-form={isSubset ? "open" : "subset"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isSubset ? "open" : "subset"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/subset`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isSubset ? SUBSET_LEAVE_LINE : SUBSET_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isSubset
          ? "Clear the tape. Status and the tote stay put."
          : `${SUBSET_STAYS_LINE} ${SUBSET_WEIGHTS_LINE} ${SUBSET_OTF_LINE} ${SUBSET_STILL_LINE} ${SUBSET_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingSubsetView({
  sheet,
  subsetIds,
}: {
  sheet: SubsetViewSheet;
  subsetIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <SubsetMissing />;
  }

  if (sheet.kind !== "digital") {
    return <SubsetRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-subset-sheet="digital"
      data-subset-state={sheet.isSubset ? "subset" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: SUBSET_MIRROR_SCRIPT }} />
      <SyncSubset listingIds={subsetIds} />

      <MallHero>
        <MallCrumb label="I will not subset it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Subset</span>
        </MallCrumb>

        <MallEyebrow>I will not subset it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isSubset ? SUBSET_NOTICE_TITLE : SUBSET_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SUBSET_TABLE_LINE} {SUBSET_WEIGHTS_LINE} {SUBSET_OTF_LINE}{" "}
            {SUBSET_WALK_LINE} {SUBSET_STAYS_LINE} {SUBSET_STILL_LINE}{" "}
            {SUBSET_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-subset-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isSubset ? (
              <Badge variant="outline">I will not subset it</Badge>
            ) : (
              <Badge variant="ghost">Still two weights</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Subset paper
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
            {sheet.isSubset
              ? "Still for sale. Seller taped the subset note. Status stays available. Not a webfont."
              : "Still two weights. Still an OTF. Tape it when walkers still want a webfont cut."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isSubset ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not subset it"
              title={SUBSET_NOTICE_TITLE}
              body={`${SUBSET_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingSubsetEmpty listingId={sheet.listingId} />
          )}

          <SubsetForm listingId={sheet.listingId} isSubset={sheet.isSubset} />

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
