import Link from "next/link";

import { ListingGrainEmpty } from "@/components/listing-grain-empty";
import { SyncGrain } from "@/components/listing-grain-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  GRAIN_CUBE_LINE,
  GRAIN_LEAVE_LINE,
  GRAIN_LOOKS_LINE,
  GRAIN_MIRROR_SCRIPT,
  GRAIN_NOTICE_TITLE,
  GRAIN_REFUSE_COPY,
  GRAIN_STAYS_LINE,
  GRAIN_STILL_LINE,
  GRAIN_TABLE_LINE,
  GRAIN_TOTE_LINE,
  GRAIN_WALK_LINE,
} from "@/lib/listing-grain";
import { listingGrainWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type GrainViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "owned";

export type GrainViewSheet = {
  kind: GrainViewKind;
  listingId: string;
  isGrain: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function GrainMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={GRAIN_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function GrainRefused({ sheet }: { sheet: GrainViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const owned = sheet.kind === "owned";

  return (
    <div data-grain-sheet={sheet.kind}>
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
        title={GRAIN_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A grain note is for three parking-lot looks, not a Game Boy and not a gift code."
              )}
            </p>
            <p>
              {GRAIN_TABLE_LINE} {GRAIN_LOOKS_LINE} {GRAIN_CUBE_LINE}{" "}
              {GRAIN_STILL_LINE}
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

function GrainForm({
  listingId,
  isGrain,
}: {
  listingId: string;
  isGrain: boolean;
}) {
  return (
    <form
      method="post"
      action={listingGrainWritePath()}
      className="space-y-3"
      data-grain-form={isGrain ? "open" : "grain"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isGrain ? "open" : "grain"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/grain`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isGrain ? GRAIN_LEAVE_LINE : GRAIN_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isGrain
          ? "Clear the tape. Status and the tote stay put."
          : `${GRAIN_STAYS_LINE} ${GRAIN_LOOKS_LINE} ${GRAIN_CUBE_LINE} ${GRAIN_STILL_LINE} ${GRAIN_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingGrainView({
  sheet,
  grainIds,
}: {
  sheet: GrainViewSheet;
  grainIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <GrainMissing />;
  }

  if (sheet.kind !== "digital") {
    return <GrainRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-grain-sheet="digital"
      data-grain-state={sheet.isGrain ? "grain" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: GRAIN_MIRROR_SCRIPT }} />
      <SyncGrain listingIds={grainIds} />

      <MallHero>
        <MallCrumb label="I will not grain them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Grain</span>
        </MallCrumb>

        <MallEyebrow>I will not grain them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isGrain ? GRAIN_NOTICE_TITLE : GRAIN_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {GRAIN_TABLE_LINE} {GRAIN_LOOKS_LINE} {GRAIN_CUBE_LINE}{" "}
            {GRAIN_WALK_LINE} {GRAIN_STAYS_LINE} {GRAIN_STILL_LINE}{" "}
            {GRAIN_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-grain-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isGrain ? (
              <Badge variant="outline">I will not grain them</Badge>
            ) : (
              <Badge variant="ghost">Still three looks</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Grain paper
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
            {sheet.isGrain
              ? "Still for sale. Seller taped the grain note. Status stays available. Not a film shop."
              : "Still three looks. Still a cube. Tape it when walkers still want 16mm on the looks."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isGrain ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not grain them"
              title={GRAIN_NOTICE_TITLE}
              body={`${GRAIN_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingGrainEmpty listingId={sheet.listingId} />
          )}

          <GrainForm listingId={sheet.listingId} isGrain={sheet.isGrain} />

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
