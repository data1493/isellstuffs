import Link from "next/link";

import { ListingGrommetEmpty } from "@/components/listing-grommet-empty";
import { SyncGrommet } from "@/components/listing-grommet-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  GROMMET_BOX_LINE,
  GROMMET_LEAVE_LINE,
  GROMMET_MIRROR_SCRIPT,
  GROMMET_NECK_LINE,
  GROMMET_NOTICE_TITLE,
  GROMMET_REFUSE_COPY,
  GROMMET_STAYS_LINE,
  GROMMET_STILL_LINE,
  GROMMET_TABLE_LINE,
  GROMMET_TOTE_LINE,
  GROMMET_WALK_LINE,
} from "@/lib/listing-grommet";
import { listingGrommetWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type GrommetViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "chair"
  | "boy"
  | "owned";

export type GrommetViewSheet = {
  kind: GrommetViewKind;
  listingId: string;
  isGrommet: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function GrommetMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={GROMMET_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function GrommetRefused({ sheet }: { sheet: GrommetViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const chair = sheet.kind === "chair";
  const boy = sheet.kind === "boy";
  const owned = sheet.kind === "owned";

  return (
    <div data-grommet-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : chair
                ? "A chair is not a shade"
                : boy
                  ? "A Game Boy is not a shade"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={GROMMET_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A grommet note is for the wobbly lamp on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {GROMMET_TABLE_LINE} {GROMMET_BOX_LINE} {GROMMET_NECK_LINE}{" "}
              {GROMMET_STILL_LINE}
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

function GrommetForm({
  listingId,
  isGrommet,
}: {
  listingId: string;
  isGrommet: boolean;
}) {
  return (
    <form
      method="post"
      action={listingGrommetWritePath()}
      className="space-y-3"
      data-grommet-form={isGrommet ? "open" : "grommet"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isGrommet ? "open" : "grommet"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/grommet`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isGrommet ? GROMMET_LEAVE_LINE : GROMMET_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isGrommet
          ? "Clear the tape. Status and the tote stay put."
          : `${GROMMET_STAYS_LINE} ${GROMMET_BOX_LINE} ${GROMMET_NECK_LINE} ${GROMMET_STILL_LINE} ${GROMMET_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingGrommetView({
  sheet,
  grommetIds,
}: {
  sheet: GrommetViewSheet;
  grommetIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <GrommetMissing />;
  }

  if (sheet.kind !== "physical") {
    return <GrommetRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-grommet-sheet="physical"
      data-grommet-state={sheet.isGrommet ? "grommet" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: GROMMET_MIRROR_SCRIPT }} />
      <SyncGrommet listingIds={grommetIds} />

      <MallHero>
        <MallCrumb label="I will not grommet it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Grommet</span>
        </MallCrumb>

        <MallEyebrow>I will not grommet it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isGrommet ? GROMMET_NOTICE_TITLE : GROMMET_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {GROMMET_TABLE_LINE} {GROMMET_BOX_LINE} {GROMMET_NECK_LINE}{" "}
            {GROMMET_WALK_LINE} {GROMMET_STAYS_LINE} {GROMMET_STILL_LINE}{" "}
            {GROMMET_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-grommet-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isGrommet ? (
              <Badge variant="outline">I will not grommet it</Badge>
            ) : (
              <Badge variant="ghost">Grommet not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Grommet paper
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
            {sheet.isGrommet
              ? "Still for sale. Seller taped the grommet note. Status stays available. Not a hardware shop."
              : "Still a tired box. Still a wobbly neck. Tape it when walkers still want the shade set."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isGrommet ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not grommet it"
              title={GROMMET_NOTICE_TITLE}
              body={`${GROMMET_STILL_LINE} avail=open still lists this lamp.`}
            />
          ) : (
            <ListingGrommetEmpty listingId={sheet.listingId} />
          )}

          <GrommetForm listingId={sheet.listingId} isGrommet={sheet.isGrommet} />

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
