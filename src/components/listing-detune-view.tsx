import Link from "next/link";

import { ListingDetuneEmpty } from "@/components/listing-detune-empty";
import { SyncDetune } from "@/components/listing-detune-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  DETUNE_FOUR_LINE,
  DETUNE_LEAVE_LINE,
  DETUNE_MIRROR_SCRIPT,
  DETUNE_NOTICE_TITLE,
  DETUNE_REFUSE_COPY,
  DETUNE_SLAPS_LINE,
  DETUNE_STAYS_LINE,
  DETUNE_STILL_LINE,
  DETUNE_TABLE_LINE,
  DETUNE_TOTE_LINE,
  DETUNE_WALK_LINE,
} from "@/lib/listing-detune";
import { listingDetuneWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type DetuneViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "font"
  | "lut"
  | "owned";

export type DetuneViewSheet = {
  kind: DetuneViewKind;
  listingId: string;
  isDetune: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function DetuneMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={DETUNE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function DetuneRefused({ sheet }: { sheet: DetuneViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const font = sheet.kind === "font";
  const lut = sheet.kind === "lut";
  const owned = sheet.kind === "owned";

  return (
    <div data-detune-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : font
              ? "A font is not twelve shots"
              : lut
                ? "A LUT pack is not twelve shots"
                : owned
                  ? "Another note already owns that one"
                  : object
                    ? "On the table"
                    : "Walked"
        }
        title={DETUNE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A detune note is for twelve shots and four dollars, not a Game Boy and not a gift code."
              )}
            </p>
            <p>
              {DETUNE_TABLE_LINE} {DETUNE_SLAPS_LINE} {DETUNE_FOUR_LINE}{" "}
              {DETUNE_STILL_LINE}
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

function DetuneForm({
  listingId,
  isDetune,
}: {
  listingId: string;
  isDetune: boolean;
}) {
  return (
    <form
      method="post"
      action={listingDetuneWritePath()}
      className="space-y-3"
      data-detune-form={isDetune ? "open" : "detune"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isDetune ? "open" : "detune"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/detune`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isDetune ? DETUNE_LEAVE_LINE : DETUNE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isDetune
          ? "Clear the tape. Status and the tote stay put."
          : `${DETUNE_STAYS_LINE} ${DETUNE_SLAPS_LINE} ${DETUNE_FOUR_LINE} ${DETUNE_STILL_LINE} ${DETUNE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingDetuneView({
  sheet,
  detuneIds,
}: {
  sheet: DetuneViewSheet;
  detuneIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <DetuneMissing />;
  }

  if (sheet.kind !== "digital") {
    return <DetuneRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-detune-sheet="digital"
      data-detune-state={sheet.isDetune ? "detune" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: DETUNE_MIRROR_SCRIPT }} />
      <SyncDetune listingIds={detuneIds} />

      <MallHero>
        <MallCrumb label="I will not detune them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Detune</span>
        </MallCrumb>

        <MallEyebrow>I will not detune them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isDetune ? DETUNE_NOTICE_TITLE : DETUNE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {DETUNE_TABLE_LINE} {DETUNE_SLAPS_LINE} {DETUNE_FOUR_LINE}{" "}
            {DETUNE_WALK_LINE} {DETUNE_STAYS_LINE} {DETUNE_STILL_LINE}{" "}
            {DETUNE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-detune-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the zip</MallEyebrow>
            {sheet.isDetune ? (
              <Badge variant="outline">I will not detune them</Badge>
            ) : (
              <Badge variant="ghost">Still slaps</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Detune paper
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
            {sheet.isDetune
              ? "Still for sale. Seller taped the detune note. Status stays available. Not a pitch shop. Not a login."
              : "Still slaps. Still four dollars. Tape it when walkers still want a shop pitch slip."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isDetune ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not detune them"
              title={DETUNE_NOTICE_TITLE}
              body={`${DETUNE_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingDetuneEmpty listingId={sheet.listingId} />
          )}

          <DetuneForm listingId={sheet.listingId} isDetune={sheet.isDetune} />

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
