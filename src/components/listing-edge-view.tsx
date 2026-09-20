import Link from "next/link";

import { ListingEdgeEmpty } from "@/components/listing-edge-empty";
import { SyncEdge } from "@/components/listing-edge-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  EDGE_LEAVE_LINE,
  EDGE_MIRROR_SCRIPT,
  EDGE_NOTICE_TITLE,
  EDGE_PAIR_LINE,
  EDGE_PEEL_LINE,
  EDGE_REFUSE_COPY,
  EDGE_STAYS_LINE,
  EDGE_STILL_LINE,
  EDGE_TABLE_LINE,
  EDGE_TOTE_LINE,
  EDGE_WALK_LINE,
} from "@/lib/listing-edge";
import { listingEdgeWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type EdgeViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "jacket"
  | "chair"
  | "owned";

export type EdgeViewSheet = {
  kind: EdgeViewKind;
  listingId: string;
  isEdge: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function EdgeMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={EDGE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function EdgeRefused({ sheet }: { sheet: EdgeViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const jacket = sheet.kind === "jacket";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-edge-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : jacket
                ? "A jacket is not a pair"
                : chair
                  ? "A chair is not a pair"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={EDGE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "An edge note is for the split-sole pair on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {EDGE_TABLE_LINE} {EDGE_PAIR_LINE} {EDGE_PEEL_LINE} {EDGE_STILL_LINE}
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

function EdgeForm({
  listingId,
  isEdge,
}: {
  listingId: string;
  isEdge: boolean;
}) {
  return (
    <form
      method="post"
      action={listingEdgeWritePath()}
      className="space-y-3"
      data-edge-form={isEdge ? "open" : "edge"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isEdge ? "open" : "edge"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/edge`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isEdge ? EDGE_LEAVE_LINE : EDGE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isEdge
          ? "Clear the tape. Status and the tote stay put."
          : `${EDGE_STAYS_LINE} ${EDGE_PAIR_LINE} ${EDGE_PEEL_LINE} ${EDGE_STILL_LINE} ${EDGE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingEdgeView({
  sheet,
  edgeIds,
}: {
  sheet: EdgeViewSheet;
  edgeIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <EdgeMissing />;
  }

  if (sheet.kind !== "physical") {
    return <EdgeRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-edge-sheet="physical"
      data-edge-state={sheet.isEdge ? "edge" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: EDGE_MIRROR_SCRIPT }} />
      <SyncEdge listingIds={edgeIds} />

      <MallHero>
        <MallCrumb label="I will not edge it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Edge</span>
        </MallCrumb>

        <MallEyebrow>I will not edge it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isEdge ? EDGE_NOTICE_TITLE : EDGE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {EDGE_TABLE_LINE} {EDGE_PAIR_LINE} {EDGE_PEEL_LINE} {EDGE_WALK_LINE}{" "}
            {EDGE_STAYS_LINE} {EDGE_STILL_LINE} {EDGE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-edge-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isEdge ? (
              <Badge variant="outline">I will not edge it</Badge>
            ) : (
              <Badge variant="ghost">Edge not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Edge paper
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
            {sheet.isEdge
              ? "Still for sale. Seller taped the edge note. Status stays available. Not a cobbler."
              : "Still a pair. Still a peel. Tape it when walkers still want the peel finished."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isEdge ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not edge it"
              title={EDGE_NOTICE_TITLE}
              body={`${EDGE_STILL_LINE} avail=open still lists this pair.`}
            />
          ) : (
            <ListingEdgeEmpty listingId={sheet.listingId} />
          )}

          <EdgeForm listingId={sheet.listingId} isEdge={sheet.isEdge} />

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
