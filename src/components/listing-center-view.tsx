import Link from "next/link";

import { ListingCenterEmpty } from "@/components/listing-center-empty";
import { SyncCenter } from "@/components/listing-center-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  CENTER_HOLE_LINE,
  CENTER_MIRROR_SCRIPT,
  CENTER_NOTICE_TITLE,
  CENTER_REFUSE_COPY,
  CENTER_STAYS_LINE,
  CENTER_STILL_LINE,
  CENTER_TABLE_LINE,
  CENTER_TOTE_LINE,
  CENTER_WALK_LINE,
} from "@/lib/listing-center";
import { listingCenterWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type CenterViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type CenterViewSheet = {
  kind: CenterViewKind;
  listingId: string;
  isCenter: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function CenterMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={CENTER_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function CenterRefused({ sheet }: { sheet: CenterViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-center-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={CENTER_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A center note is for a record on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {CENTER_TABLE_LINE} {CENTER_HOLE_LINE} {CENTER_STILL_LINE}
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

function CenterForm({
  listingId,
  isCenter,
}: {
  listingId: string;
  isCenter: boolean;
}) {
  return (
    <form
      method="post"
      action={listingCenterWritePath()}
      className="space-y-3"
      data-center-form={isCenter ? "open" : "center"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isCenter ? "open" : "center"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/center`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isCenter ? "Leave the hole" : "I will not center it"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isCenter
          ? "Clear the tape. Status and the tote stay put."
          : `${CENTER_STAYS_LINE} ${CENTER_HOLE_LINE} ${CENTER_STILL_LINE} ${CENTER_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingCenterView({
  sheet,
  centerIds,
}: {
  sheet: CenterViewSheet;
  centerIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <CenterMissing />;
  }

  if (sheet.kind !== "physical") {
    return <CenterRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-center-sheet="physical"
      data-center-state={sheet.isCenter ? "center" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: CENTER_MIRROR_SCRIPT }} />
      <SyncCenter listingIds={centerIds} />

      <MallHero>
        <MallCrumb label="I will not center it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Center</span>
        </MallCrumb>

        <MallEyebrow>I will not center it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isCenter ? CENTER_NOTICE_TITLE : CENTER_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {CENTER_TABLE_LINE} {CENTER_HOLE_LINE} {CENTER_WALK_LINE}{" "}
            {CENTER_STAYS_LINE} {CENTER_STILL_LINE} {CENTER_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-center-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isCenter ? (
              <Badge variant="outline">I will not center it</Badge>
            ) : (
              <Badge variant="ghost">Center not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Center paper
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
            {sheet.isCenter
              ? "Still for sale. Seller taped the center note. Status stays available. Not a press."
              : "Off-center. Still plays. Tape it when walkers still want the hole true."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isCenter ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not center it"
              title={CENTER_NOTICE_TITLE}
              body={`${CENTER_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingCenterEmpty listingId={sheet.listingId} />
          )}

          <CenterForm listingId={sheet.listingId} isCenter={sheet.isCenter} />

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
