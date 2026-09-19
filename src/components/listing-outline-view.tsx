import Link from "next/link";

import { ListingOutlineEmpty } from "@/components/listing-outline-empty";
import { SyncOutline } from "@/components/listing-outline-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  OUTLINE_LEAVE_LINE,
  OUTLINE_MIRROR_SCRIPT,
  OUTLINE_NOTICE_TITLE,
  OUTLINE_OTF_LINE,
  OUTLINE_REFUSE_COPY,
  OUTLINE_STAYS_LINE,
  OUTLINE_STILL_LINE,
  OUTLINE_TABLE_LINE,
  OUTLINE_TOTE_LINE,
  OUTLINE_WALK_LINE,
  OUTLINE_WEIGHTS_LINE,
} from "@/lib/listing-outline";
import { listingOutlineWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type OutlineViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "pack"
  | "lut"
  | "chair"
  | "owned";

export type OutlineViewSheet = {
  kind: OutlineViewKind;
  listingId: string;
  isOutline: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function OutlineMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={OUTLINE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function OutlineRefused({ sheet }: { sheet: OutlineViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const pack = sheet.kind === "pack";
  const lut = sheet.kind === "lut";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-outline-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : pack
              ? "A pack is not a font"
              : lut
                ? "A LUT is not a font"
                : chair
                  ? "A chair is not a font"
                  : owned
                    ? "Another note already owns that one"
                    : object
                      ? "On the table"
                      : "Walked"
        }
        title={OUTLINE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "An outline note is for the booth font, not a pack and not a gift code."
              )}
            </p>
            <p>
              {OUTLINE_TABLE_LINE} {OUTLINE_WEIGHTS_LINE} {OUTLINE_OTF_LINE}{" "}
              {OUTLINE_STILL_LINE}
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

function OutlineForm({
  listingId,
  isOutline,
}: {
  listingId: string;
  isOutline: boolean;
}) {
  return (
    <form
      method="post"
      action={listingOutlineWritePath()}
      className="space-y-3"
      data-outline-form={isOutline ? "open" : "outline"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isOutline ? "open" : "outline"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/outline`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isOutline ? OUTLINE_LEAVE_LINE : OUTLINE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isOutline
          ? "Clear the tape. Status and the tote stay put."
          : `${OUTLINE_STAYS_LINE} ${OUTLINE_WEIGHTS_LINE} ${OUTLINE_OTF_LINE} ${OUTLINE_STILL_LINE} ${OUTLINE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingOutlineView({
  sheet,
  outlineIds,
}: {
  sheet: OutlineViewSheet;
  outlineIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <OutlineMissing />;
  }

  if (sheet.kind !== "digital") {
    return <OutlineRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-outline-sheet="digital"
      data-outline-state={sheet.isOutline ? "outline" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: OUTLINE_MIRROR_SCRIPT }} />
      <SyncOutline listingIds={outlineIds} />

      <MallHero>
        <MallCrumb label="I will not outline them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Outline</span>
        </MallCrumb>

        <MallEyebrow>I will not outline them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isOutline ? OUTLINE_NOTICE_TITLE : OUTLINE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {OUTLINE_TABLE_LINE} {OUTLINE_WEIGHTS_LINE} {OUTLINE_OTF_LINE}{" "}
            {OUTLINE_WALK_LINE} {OUTLINE_STAYS_LINE} {OUTLINE_STILL_LINE}{" "}
            {OUTLINE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-outline-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isOutline ? (
              <Badge variant="outline">I will not outline them</Badge>
            ) : (
              <Badge variant="ghost">Outline not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Outline paper
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
            {sheet.isOutline
              ? "Still for sale. Seller taped the outline note. Status stays available. Not a type shop."
              : "Still two weights. Still OTF. Tape it when walkers still want the map outlined."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isOutline ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not outline them"
              title={OUTLINE_NOTICE_TITLE}
              body={`${OUTLINE_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingOutlineEmpty listingId={sheet.listingId} />
          )}

          <OutlineForm listingId={sheet.listingId} isOutline={sheet.isOutline} />

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
