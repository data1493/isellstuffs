import Link from "next/link";

import { ListingGlowEmpty } from "@/components/listing-glow-empty";
import { SyncGlow } from "@/components/listing-glow-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  GLOW_LINE_LINE,
  GLOW_MIRROR_SCRIPT,
  GLOW_NOTICE_TITLE,
  GLOW_PLAYS_LINE,
  GLOW_REFUSE_COPY,
  GLOW_STAYS_LINE,
  GLOW_STILL_LINE,
  GLOW_TABLE_LINE,
  GLOW_TOTE_LINE,
  GLOW_WALK_LINE,
} from "@/lib/listing-glow";
import { listingGlowWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type GlowViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type GlowViewSheet = {
  kind: GlowViewKind;
  listingId: string;
  isGlow: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function GlowMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={GLOW_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function GlowRefused({ sheet }: { sheet: GlowViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-glow-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={GLOW_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A backlight note is for a handheld on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {GLOW_TABLE_LINE} {GLOW_LINE_LINE} {GLOW_PLAYS_LINE} {GLOW_STILL_LINE}
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

function GlowForm({
  listingId,
  isGlow,
}: {
  listingId: string;
  isGlow: boolean;
}) {
  return (
    <form
      method="post"
      action={listingGlowWritePath()}
      className="space-y-3"
      data-glow-form={isGlow ? "open" : "glow"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isGlow ? "open" : "glow"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/glow`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isGlow ? "Leave the line" : "I don't have a backlight"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isGlow
          ? "Clear the tape. Status and the tote stay put."
          : `${GLOW_STAYS_LINE} ${GLOW_LINE_LINE} ${GLOW_STILL_LINE} ${GLOW_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingGlowView({
  sheet,
  glowIds,
}: {
  sheet: GlowViewSheet;
  glowIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <GlowMissing />;
  }

  if (sheet.kind !== "physical") {
    return <GlowRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-glow-sheet="physical"
      data-glow-state={sheet.isGlow ? "glow" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: GLOW_MIRROR_SCRIPT }} />
      <SyncGlow listingIds={glowIds} />

      <MallHero>
        <MallCrumb label="I don't have a backlight">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Glow</span>
        </MallCrumb>

        <MallEyebrow>I don't have a backlight</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isGlow ? GLOW_NOTICE_TITLE : GLOW_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {GLOW_TABLE_LINE} {GLOW_LINE_LINE} {GLOW_PLAYS_LINE} {GLOW_WALK_LINE}{" "}
            {GLOW_STAYS_LINE} {GLOW_STILL_LINE} {GLOW_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-glow-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isGlow ? (
              <Badge variant="outline">I don't have a backlight</Badge>
            ) : (
              <Badge variant="ghost">Backlight not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Glow paper
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
            {sheet.isGlow
              ? "Still for sale. Seller taped the glow note. Status stays available. Line stays. Still plays."
              : "Line stays. Still plays. Tape it when walkers still want a light behind Tetris."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isGlow ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a backlight"
              title={GLOW_NOTICE_TITLE}
              body={`${GLOW_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingGlowEmpty listingId={sheet.listingId} />
          )}

          <GlowForm listingId={sheet.listingId} isGlow={sheet.isGlow} />

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
