import Link from "next/link";

import { ListingGlassEmpty } from "@/components/listing-glass-empty";
import { SyncGlass } from "@/components/listing-glass-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  GLASS_KNOB_LINE,
  GLASS_LID_LINE,
  GLASS_MIRROR_SCRIPT,
  GLASS_NOTICE_TITLE,
  GLASS_REFUSE_COPY,
  GLASS_STAYS_LINE,
  GLASS_STILL_LINE,
  GLASS_TABLE_LINE,
  GLASS_TOTE_LINE,
  GLASS_WALK_LINE,
  GLASS_WRAP_LINE,
} from "@/lib/listing-glass";
import { listingGlassWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type GlassViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type GlassViewSheet = {
  kind: GlassViewKind;
  listingId: string;
  isGlass: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function GlassMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={GLASS_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function GlassRefused({ sheet }: { sheet: GlassViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-glass-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={GLASS_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A glass refusal is for a lid on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {GLASS_TABLE_LINE} {GLASS_LID_LINE} {GLASS_KNOB_LINE}{" "}
              {GLASS_STILL_LINE}
            </p>
          </div>
        }
        actions={
          <>
            {sheet.listing ? (
              <Button
                className="rounded-full px-5"
                render={<Link href={listingPath(sheet.listing.id)} />}
              >
                Back to the listing
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="rounded-full px-5"
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

function GlassForm({
  listingId,
  isGlass,
}: {
  listingId: string;
  isGlass: boolean;
}) {
  return (
    <form
      method="post"
      action={listingGlassWritePath()}
      className="space-y-3"
      data-glass-form={isGlass ? "open" : "glass"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isGlass ? "open" : "glass"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/glass`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isGlass ? "Leave the lid" : "I will not replace the glass"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isGlass
          ? "Clear the tape. Status and the tote stay put."
          : `${GLASS_STAYS_LINE} ${GLASS_LID_LINE} ${GLASS_STILL_LINE} ${GLASS_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingGlassView({
  sheet,
  glassIds,
}: {
  sheet: GlassViewSheet;
  glassIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <GlassMissing />;
  }

  if (sheet.kind !== "physical") {
    return <GlassRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-glass-sheet="physical"
      data-glass-state={sheet.isGlass ? "glass" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: GLASS_MIRROR_SCRIPT }} />
      <SyncGlass listingIds={glassIds} />

      <MallHero>
        <MallCrumb label="I will not replace the glass">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Glass</span>
        </MallCrumb>

        <MallEyebrow>Glass refusal</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isGlass ? GLASS_NOTICE_TITLE : GLASS_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {GLASS_NOTICE_TITLE} {GLASS_KNOB_LINE} {GLASS_WRAP_LINE} {GLASS_WALK_LINE}{" "}
            {GLASS_STAYS_LINE} {GLASS_STILL_LINE} {GLASS_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-glass-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isGlass ? (
              <Badge variant="outline">I will not replace the glass</Badge>
            ) : (
              <Badge variant="ghost">Glass not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Glass tag
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
            {sheet.isGlass
              ? "Still for sale. Seller taped the glass refusal. Status stays available. Not a fourth status."
              : "Knob is the wiggle. Fits is the 3-quart. Wrap is newspaper. Tape the refusal when walkers still want new lid glass."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isGlass ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not replace the glass"
              title={GLASS_NOTICE_TITLE}
              body={`${GLASS_STAYS_LINE} ${GLASS_LID_LINE} ${GLASS_STILL_LINE} avail=open still lists this lid.`}
            />
          ) : (
            <ListingGlassEmpty listingId={sheet.listingId} />
          )}

          <GlassForm listingId={sheet.listingId} isGlass={sheet.isGlass} />

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={listingPath(sheet.listingId)} />}
            >
              Back to the listing
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={exploreHref({ avail: "open" })} />}
            >
              Still here on the concourse
            </Button>
            {stallHref ? (
              <Button
                variant="outline"
                className="w-full rounded-full sm:w-auto"
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
