import Link from "next/link";

import { ListingTrussEmpty } from "@/components/listing-truss-empty";
import { SyncTruss } from "@/components/listing-truss-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  TRUSS_BENT_LINE,
  TRUSS_LEAVE_LINE,
  TRUSS_METAL_LINE,
  TRUSS_MIRROR_SCRIPT,
  TRUSS_NOTICE_TITLE,
  TRUSS_REFUSE_COPY,
  TRUSS_STAYS_LINE,
  TRUSS_STILL_LINE,
  TRUSS_TABLE_LINE,
  TRUSS_TOTE_LINE,
  TRUSS_WALK_LINE,
} from "@/lib/listing-truss";
import { listingPath, listingTrussWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type TrussViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "mug"
  | "lid"
  | "owned";

export type TrussViewSheet = {
  kind: TrussViewKind;
  listingId: string;
  isTruss: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function TrussMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={TRUSS_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function TrussRefused({ sheet }: { sheet: TrussViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const mug = sheet.kind === "mug";
  const lid = sheet.kind === "lid";
  const owned = sheet.kind === "owned";

  return (
    <div data-truss-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : mug
                ? "A mug is not a truss"
                : lid
                  ? "A lid is not a truss"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={TRUSS_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A truss note is for the balloon whisk on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {TRUSS_TABLE_LINE} {TRUSS_BENT_LINE} {TRUSS_METAL_LINE}{" "}
              {TRUSS_STILL_LINE}
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

function TrussForm({
  listingId,
  isTruss,
}: {
  listingId: string;
  isTruss: boolean;
}) {
  return (
    <form
      method="post"
      action={listingTrussWritePath()}
      className="space-y-3"
      data-truss-form={isTruss ? "open" : "truss"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isTruss ? "open" : "truss"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/truss`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isTruss ? TRUSS_LEAVE_LINE : TRUSS_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isTruss
          ? "Clear the tape. Status and the tote stay put."
          : `${TRUSS_STAYS_LINE} ${TRUSS_BENT_LINE} ${TRUSS_METAL_LINE} ${TRUSS_STILL_LINE} ${TRUSS_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingTrussView({
  sheet,
  trussIds,
}: {
  sheet: TrussViewSheet;
  trussIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <TrussMissing />;
  }

  if (sheet.kind !== "physical") {
    return <TrussRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-truss-sheet="physical"
      data-truss-state={sheet.isTruss ? "truss" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: TRUSS_MIRROR_SCRIPT }} />
      <SyncTruss listingIds={trussIds} />

      <MallHero>
        <MallCrumb label="I will not truss it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Truss</span>
        </MallCrumb>

        <MallEyebrow>I will not truss it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isTruss ? TRUSS_NOTICE_TITLE : TRUSS_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {TRUSS_TABLE_LINE} {TRUSS_BENT_LINE} {TRUSS_METAL_LINE}{" "}
            {TRUSS_WALK_LINE} {TRUSS_STAYS_LINE} {TRUSS_STILL_LINE}{" "}
            {TRUSS_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-truss-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isTruss ? (
              <Badge variant="outline">I will not truss it</Badge>
            ) : (
              <Badge variant="ghost">Truss not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Truss paper
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
            {sheet.isTruss
              ? "Still for sale. Seller taped the truss note. Status stays available. Not a kitchen string."
              : "Still bent. Still metal. Tape it when walkers still want the balloon tied."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isTruss ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not truss it"
              title={TRUSS_NOTICE_TITLE}
              body={`${TRUSS_STILL_LINE} avail=open still lists this whisk.`}
            />
          ) : (
            <ListingTrussEmpty listingId={sheet.listingId} />
          )}

          <TrussForm listingId={sheet.listingId} isTruss={sheet.isTruss} />

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
