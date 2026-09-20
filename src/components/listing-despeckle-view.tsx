import Link from "next/link";

import { ListingDespeckleEmpty } from "@/components/listing-despeckle-empty";
import { SyncDespeckle } from "@/components/listing-despeckle-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  DESPECKLE_CARDS_LINE,
  DESPECKLE_GREASE_LINE,
  DESPECKLE_LEAVE_LINE,
  DESPECKLE_MIRROR_SCRIPT,
  DESPECKLE_NOTICE_TITLE,
  DESPECKLE_REFUSE_COPY,
  DESPECKLE_STAYS_LINE,
  DESPECKLE_STILL_LINE,
  DESPECKLE_TABLE_LINE,
  DESPECKLE_TOTE_LINE,
  DESPECKLE_WALK_LINE,
} from "@/lib/listing-despeckle";
import { listingDespeckleWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type DespeckleViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "owned";

export type DespeckleViewSheet = {
  kind: DespeckleViewKind;
  listingId: string;
  isDespeckle: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function DespeckleMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={DESPECKLE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function DespeckleRefused({ sheet }: { sheet: DespeckleViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const owned = sheet.kind === "owned";

  return (
    <div data-despeckle-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : owned
              ? "Another note already owns that one"
              : object
                ? "On the table"
                : "Walked"
        }
        title={DESPECKLE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A despeckle note is for three recipe cards, not a liner and not a gift code."
              )}
            </p>
            <p>
              {DESPECKLE_TABLE_LINE} {DESPECKLE_CARDS_LINE} {DESPECKLE_GREASE_LINE}{" "}
              {DESPECKLE_STILL_LINE}
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

function DespeckleForm({
  listingId,
  isDespeckle,
}: {
  listingId: string;
  isDespeckle: boolean;
}) {
  return (
    <form
      method="post"
      action={listingDespeckleWritePath()}
      className="space-y-3"
      data-despeckle-form={isDespeckle ? "open" : "despeckle"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isDespeckle ? "open" : "despeckle"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/despeckle`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isDespeckle ? DESPECKLE_LEAVE_LINE : DESPECKLE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isDespeckle
          ? "Clear the tape. Status and the tote stay put."
          : `${DESPECKLE_STAYS_LINE} ${DESPECKLE_CARDS_LINE} ${DESPECKLE_GREASE_LINE} ${DESPECKLE_STILL_LINE} ${DESPECKLE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingDespeckleView({
  sheet,
  despeckleIds,
}: {
  sheet: DespeckleViewSheet;
  despeckleIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <DespeckleMissing />;
  }

  if (sheet.kind !== "digital") {
    return <DespeckleRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-despeckle-sheet="digital"
      data-despeckle-state={sheet.isDespeckle ? "despeckle" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: DESPECKLE_MIRROR_SCRIPT }} />
      <SyncDespeckle listingIds={despeckleIds} />

      <MallHero>
        <MallCrumb label="I will not despeckle them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Despeckle</span>
        </MallCrumb>

        <MallEyebrow>I will not despeckle them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isDespeckle ? DESPECKLE_NOTICE_TITLE : DESPECKLE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {DESPECKLE_TABLE_LINE} {DESPECKLE_CARDS_LINE} {DESPECKLE_GREASE_LINE}{" "}
            {DESPECKLE_WALK_LINE} {DESPECKLE_STAYS_LINE} {DESPECKLE_STILL_LINE}{" "}
            {DESPECKLE_TOTE_LINE} Heal the flecks, not a login.
            Register stays print bars.
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-despeckle-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isDespeckle ? (
              <Badge variant="outline">I will not despeckle them</Badge>
            ) : (
              <Badge variant="ghost">Still three cards</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Despeckle paper
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
            {sheet.isDespeckle
              ? "Still for sale. Seller taped the despeckle note. Status stays available. Not a shop despeckle."
              : "Still three cards. Still grease. Tape it when walkers still want the flecks healed."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isDespeckle ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not despeckle them"
              title={DESPECKLE_NOTICE_TITLE}
              body={`${DESPECKLE_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingDespeckleEmpty listingId={sheet.listingId} />
          )}

          <DespeckleForm listingId={sheet.listingId} isDespeckle={sheet.isDespeckle} />

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
