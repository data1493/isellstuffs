import Link from "next/link";

import { ListingAtipEmpty } from "@/components/listing-atip-empty";
import { SyncAtip } from "@/components/listing-atip-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  ATIP_JEWEL_LINE,
  ATIP_LEAVE_LINE,
  ATIP_MIRROR_SCRIPT,
  ATIP_NOTICE_TITLE,
  ATIP_REFUSE_COPY,
  ATIP_SHARPIE_LINE,
  ATIP_STAYS_LINE,
  ATIP_STILL_LINE,
  ATIP_TABLE_LINE,
  ATIP_TOTE_LINE,
  ATIP_WALK_LINE,
} from "@/lib/listing-atip";
import { listingAtipWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type AtipViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "pack"
  | "mixtape"
  | "font"
  | "chair"
  | "owned";

export type AtipViewSheet = {
  kind: AtipViewKind;
  listingId: string;
  isAtip: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function AtipMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={ATIP_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function AtipRefused({ sheet }: { sheet: AtipViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const pack = sheet.kind === "pack";
  const mixtape = sheet.kind === "mixtape";
  const font = sheet.kind === "font";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-atip-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : pack
                ? "A pack is not a disc"
                : mixtape
                  ? "A cassette is not a disc"
                  : font
                    ? "A font is not a disc"
                    : chair
                      ? "A chair is not a disc"
                      : owned
                        ? "Another note already owns that one"
                        : "Walked"
        }
        title={ATIP_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "An atip note is for the burned disc on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {ATIP_TABLE_LINE} {ATIP_SHARPIE_LINE} {ATIP_JEWEL_LINE}{" "}
              {ATIP_STILL_LINE}
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

function AtipForm({
  listingId,
  isAtip,
}: {
  listingId: string;
  isAtip: boolean;
}) {
  return (
    <form
      method="post"
      action={listingAtipWritePath()}
      className="space-y-3"
      data-atip-form={isAtip ? "open" : "atip"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isAtip ? "open" : "atip"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/atip`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isAtip ? ATIP_LEAVE_LINE : ATIP_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isAtip
          ? "Clear the tape. Status and the tote stay put."
          : `${ATIP_STAYS_LINE} ${ATIP_SHARPIE_LINE} ${ATIP_JEWEL_LINE} ${ATIP_STILL_LINE} ${ATIP_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingAtipView({
  sheet,
  atipIds,
}: {
  sheet: AtipViewSheet;
  atipIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <AtipMissing />;
  }

  if (sheet.kind !== "physical") {
    return <AtipRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-atip-sheet="physical"
      data-atip-state={sheet.isAtip ? "atip" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: ATIP_MIRROR_SCRIPT }} />
      <SyncAtip listingIds={atipIds} />

      <MallHero>
        <MallCrumb label="I will not atip it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Atip</span>
        </MallCrumb>

        <MallEyebrow>I will not atip it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isAtip ? ATIP_NOTICE_TITLE : ATIP_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {ATIP_TABLE_LINE} {ATIP_SHARPIE_LINE} {ATIP_JEWEL_LINE}{" "}
            {ATIP_WALK_LINE} {ATIP_STAYS_LINE} {ATIP_STILL_LINE}{" "}
            {ATIP_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-atip-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isAtip ? (
              <Badge variant="outline">I will not atip it</Badge>
            ) : (
              <Badge variant="ghost">Atip not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Atip paper
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
            {sheet.isAtip
              ? "Still for sale. Seller taped the atip note. Status stays available. Not a shop."
              : "Still Sharpie. Still a jewel case. Tape it when walkers still want shop ATIP IDs."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isAtip ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not atip it"
              title={ATIP_NOTICE_TITLE}
              body={`${ATIP_STILL_LINE} avail=open still lists this disc.`}
            />
          ) : (
            <ListingAtipEmpty listingId={sheet.listingId} />
          )}

          <AtipForm listingId={sheet.listingId} isAtip={sheet.isAtip} />

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
