import Link from "next/link";

import { ListingWeldEmpty } from "@/components/listing-weld-empty";
import { SyncWeld } from "@/components/listing-weld-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  WELD_EMPTIES_LINE,
  WELD_HINGE_LINE,
  WELD_LEAVE_LINE,
  WELD_MIRROR_SCRIPT,
  WELD_NOTICE_TITLE,
  WELD_REFUSE_COPY,
  WELD_STAYS_LINE,
  WELD_STILL_LINE,
  WELD_TABLE_LINE,
  WELD_TOTE_LINE,
  WELD_WALK_LINE,
} from "@/lib/listing-weld";
import { listingWeldWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type WeldViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type WeldViewSheet = {
  kind: WeldViewKind;
  listingId: string;
  isWeld: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function WeldMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={WELD_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function WeldRefused({ sheet }: { sheet: WeldViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-weld-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={WELD_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A weld note is for a pile of empty jewels on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {WELD_TABLE_LINE} {WELD_EMPTIES_LINE} {WELD_HINGE_LINE} {WELD_STILL_LINE}
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

function WeldForm({
  listingId,
  isWeld,
}: {
  listingId: string;
  isWeld: boolean;
}) {
  return (
    <form
      method="post"
      action={listingWeldWritePath()}
      className="space-y-3"
      data-weld-form={isWeld ? "open" : "weld"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isWeld ? "open" : "weld"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/weld`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isWeld ? WELD_LEAVE_LINE : WELD_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isWeld
          ? "Clear the tape. Status and the tote stay put."
          : `${WELD_STAYS_LINE} ${WELD_EMPTIES_LINE} ${WELD_HINGE_LINE} ${WELD_STILL_LINE} ${WELD_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingWeldView({
  sheet,
  weldIds,
}: {
  sheet: WeldViewSheet;
  weldIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <WeldMissing />;
  }

  if (sheet.kind !== "physical") {
    return <WeldRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-weld-sheet="physical"
      data-weld-state={sheet.isWeld ? "weld" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: WELD_MIRROR_SCRIPT }} />
      <SyncWeld listingIds={weldIds} />

      <MallHero>
        <MallCrumb label="I will not weld them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Weld</span>
        </MallCrumb>

        <MallEyebrow>I will not weld them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isWeld ? WELD_NOTICE_TITLE : WELD_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {WELD_TABLE_LINE} {WELD_EMPTIES_LINE} {WELD_HINGE_LINE} {WELD_WALK_LINE}{" "}
            {WELD_STAYS_LINE} {WELD_STILL_LINE} {WELD_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-weld-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isWeld ? (
              <Badge variant="outline">I will not weld them</Badge>
            ) : (
              <Badge variant="ghost">Weld not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Weld paper
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
            {sheet.isWeld
              ? "Still for sale. Seller taped the weld note. Status stays available. Not a closer."
              : "Still five empties. Still one hinge gone. Tape it when walkers still want the jewels ultrasonicked."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isWeld ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not weld them"
              title={WELD_NOTICE_TITLE}
              body={`${WELD_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingWeldEmpty listingId={sheet.listingId} />
          )}

          <WeldForm listingId={sheet.listingId} isWeld={sheet.isWeld} />

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
