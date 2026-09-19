import Link from "next/link";

import { ListingRivetEmpty } from "@/components/listing-rivet-empty";
import { SyncRivet } from "@/components/listing-rivet-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  RIVET_BOX_LINE,
  RIVET_LEAVE_LINE,
  RIVET_MIRROR_SCRIPT,
  RIVET_NOTICE_TITLE,
  RIVET_OPTIONAL_LINE,
  RIVET_REFUSE_COPY,
  RIVET_STAYS_LINE,
  RIVET_STILL_LINE,
  RIVET_TABLE_LINE,
  RIVET_TOTE_LINE,
  RIVET_WALK_LINE,
} from "@/lib/listing-rivet";
import { listingPath, listingRivetWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type RivetViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "chair"
  | "disc"
  | "owned";

export type RivetViewSheet = {
  kind: RivetViewKind;
  listingId: string;
  isRivet: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function RivetMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={RIVET_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function RivetRefused({ sheet }: { sheet: RivetViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const chair = sheet.kind === "chair";
  const disc = sheet.kind === "disc";
  const owned = sheet.kind === "owned";

  return (
    <div data-rivet-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : chair
                ? "A chair is not a shade"
                : disc
                  ? "A disc is not a shade"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={RIVET_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A rivet note is for the wobbly lamp on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {RIVET_TABLE_LINE} {RIVET_OPTIONAL_LINE} {RIVET_BOX_LINE}{" "}
              {RIVET_STILL_LINE}
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

function RivetForm({
  listingId,
  isRivet,
}: {
  listingId: string;
  isRivet: boolean;
}) {
  return (
    <form
      method="post"
      action={listingRivetWritePath()}
      className="space-y-3"
      data-rivet-form={isRivet ? "open" : "rivet"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isRivet ? "open" : "rivet"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/rivet`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isRivet ? RIVET_LEAVE_LINE : RIVET_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isRivet
          ? "Clear the tape. Status and the tote stay put."
          : `${RIVET_STAYS_LINE} ${RIVET_OPTIONAL_LINE} ${RIVET_BOX_LINE} ${RIVET_STILL_LINE} ${RIVET_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingRivetView({
  sheet,
  rivetIds,
}: {
  sheet: RivetViewSheet;
  rivetIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <RivetMissing />;
  }

  if (sheet.kind !== "physical") {
    return <RivetRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-rivet-sheet="physical"
      data-rivet-state={sheet.isRivet ? "rivet" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: RIVET_MIRROR_SCRIPT }} />
      <SyncRivet listingIds={rivetIds} />

      <MallHero>
        <MallCrumb label="I will not rivet it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Rivet</span>
        </MallCrumb>

        <MallEyebrow>I will not rivet it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isRivet ? RIVET_NOTICE_TITLE : RIVET_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {RIVET_TABLE_LINE} {RIVET_OPTIONAL_LINE} {RIVET_BOX_LINE}{" "}
            {RIVET_WALK_LINE} {RIVET_STAYS_LINE} {RIVET_STILL_LINE}{" "}
            {RIVET_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-rivet-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isRivet ? (
              <Badge variant="outline">I will not rivet it</Badge>
            ) : (
              <Badge variant="ghost">Rivet not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Rivet paper
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
            {sheet.isRivet
              ? "Still for sale. Seller taped the rivet note. Status stays available. Not a hardware shop."
              : "Still optional. Still in the box. Tape it when walkers still want the shade pinned."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isRivet ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not rivet it"
              title={RIVET_NOTICE_TITLE}
              body={`${RIVET_STILL_LINE} avail=open still lists this lamp.`}
            />
          ) : (
            <ListingRivetEmpty listingId={sheet.listingId} />
          )}

          <RivetForm listingId={sheet.listingId} isRivet={sheet.isRivet} />

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
