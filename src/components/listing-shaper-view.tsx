import Link from "next/link";

import { ListingShaperEmpty } from "@/components/listing-shaper-empty";
import { SyncShaper } from "@/components/listing-shaper-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  SHAPER_FLUORO_LINE,
  SHAPER_LEAVE_LINE,
  SHAPER_LOOKS_LINE,
  SHAPER_MIRROR_SCRIPT,
  SHAPER_NOTICE_TITLE,
  SHAPER_REFUSE_COPY,
  SHAPER_STAYS_LINE,
  SHAPER_STILL_LINE,
  SHAPER_TABLE_LINE,
  SHAPER_TOTE_LINE,
  SHAPER_WALK_LINE,
} from "@/lib/listing-shaper";
import { listingPath, listingShaperWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type ShaperViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "owned";

export type ShaperViewSheet = {
  kind: ShaperViewKind;
  listingId: string;
  isShaper: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function ShaperMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={SHAPER_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function ShaperRefused({ sheet }: { sheet: ShaperViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const owned = sheet.kind === "owned";

  return (
    <div data-shaper-sheet={sheet.kind}>
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
        title={SHAPER_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A shaper note is for three parking-lot looks, not a Game Boy and not a gift code."
              )}
            </p>
            <p>
              {SHAPER_TABLE_LINE} {SHAPER_LOOKS_LINE} {SHAPER_FLUORO_LINE}{" "}
              {SHAPER_STILL_LINE}
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

function ShaperForm({
  listingId,
  isShaper,
}: {
  listingId: string;
  isShaper: boolean;
}) {
  return (
    <form
      method="post"
      action={listingShaperWritePath()}
      className="space-y-3"
      data-shaper-form={isShaper ? "open" : "shaper"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isShaper ? "open" : "shaper"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/shaper`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isShaper ? SHAPER_LEAVE_LINE : SHAPER_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isShaper
          ? "Clear the tape. Status and the tote stay put."
          : `${SHAPER_STAYS_LINE} ${SHAPER_LOOKS_LINE} ${SHAPER_FLUORO_LINE} ${SHAPER_STILL_LINE} ${SHAPER_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingShaperView({
  sheet,
  shaperIds,
}: {
  sheet: ShaperViewSheet;
  shaperIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <ShaperMissing />;
  }

  if (sheet.kind !== "digital") {
    return <ShaperRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-shaper-sheet="digital"
      data-shaper-state={sheet.isShaper ? "shaper" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: SHAPER_MIRROR_SCRIPT }} />
      <SyncShaper listingIds={shaperIds} />

      <MallHero>
        <MallCrumb label="I will not shaper them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Shaper</span>
        </MallCrumb>

        <MallEyebrow>I will not shaper them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isShaper ? SHAPER_NOTICE_TITLE : SHAPER_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SHAPER_TABLE_LINE} {SHAPER_LOOKS_LINE} {SHAPER_FLUORO_LINE}{" "}
            {SHAPER_WALK_LINE} {SHAPER_STAYS_LINE} {SHAPER_STILL_LINE}{" "}
            {SHAPER_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-shaper-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isShaper ? (
              <Badge variant="outline">I will not shaper them</Badge>
            ) : (
              <Badge variant="ghost">Still three looks</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Shaper paper
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
            {sheet.isShaper
              ? "Still for sale. Seller taped the shaper note. Status stays available. Not a grade shop."
              : "Still three looks. Still fluorescent. Tape it when walkers still want a 1D on the looks."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isShaper ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not shaper them"
              title={SHAPER_NOTICE_TITLE}
              body={`${SHAPER_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingShaperEmpty listingId={sheet.listingId} />
          )}

          <ShaperForm listingId={sheet.listingId} isShaper={sheet.isShaper} />

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
