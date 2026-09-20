import Link from "next/link";

import { ListingAcesEmpty } from "@/components/listing-aces-empty";
import { SyncAces } from "@/components/listing-aces-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  ACES_FLUOR_LINE,
  ACES_LEAVE_LINE,
  ACES_LOT_LINE,
  ACES_MIRROR_SCRIPT,
  ACES_NOTICE_TITLE,
  ACES_REFUSE_COPY,
  ACES_STAYS_LINE,
  ACES_STILL_LINE,
  ACES_TABLE_LINE,
  ACES_TOTE_LINE,
  ACES_WALK_LINE,
} from "@/lib/listing-aces";
import { listingAcesWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type AcesViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "pack"
  | "font"
  | "pdf"
  | "chair"
  | "owned";

export type AcesViewSheet = {
  kind: AcesViewKind;
  listingId: string;
  isAces: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function AcesMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={ACES_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function AcesRefused({ sheet }: { sheet: AcesViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const pack = sheet.kind === "pack";
  const font = sheet.kind === "font";
  const pdf = sheet.kind === "pdf";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-aces-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : pack
              ? "A pack is not a LUT"
              : font
                ? "A font is not a LUT"
                : pdf
                  ? "A junk PDF is not a LUT"
                  : chair
                    ? "A chair is not a LUT"
                    : owned
                      ? "Another note already owns that one"
                      : object
                        ? "On the table"
                        : "Walked"
        }
        title={ACES_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "An aces note is for the parking-lot LUT pack, not a pack and not a gift code."
              )}
            </p>
            <p>
              {ACES_TABLE_LINE} {ACES_LOT_LINE} {ACES_FLUOR_LINE}{" "}
              {ACES_STILL_LINE}
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

function AcesForm({
  listingId,
  isAces,
}: {
  listingId: string;
  isAces: boolean;
}) {
  return (
    <form
      method="post"
      action={listingAcesWritePath()}
      className="space-y-3"
      data-aces-form={isAces ? "open" : "aces"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isAces ? "open" : "aces"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/aces`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isAces ? ACES_LEAVE_LINE : ACES_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isAces
          ? "Clear the tape. Status and the tote stay put."
          : `${ACES_STAYS_LINE} ${ACES_LOT_LINE} ${ACES_FLUOR_LINE} ${ACES_STILL_LINE} ${ACES_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingAcesView({
  sheet,
  acesIds,
}: {
  sheet: AcesViewSheet;
  acesIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <AcesMissing />;
  }

  if (sheet.kind !== "digital") {
    return <AcesRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-aces-sheet="digital"
      data-aces-state={sheet.isAces ? "aces" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: ACES_MIRROR_SCRIPT }} />
      <SyncAces listingIds={acesIds} />

      <MallHero>
        <MallCrumb label="I will not aces it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Aces</span>
        </MallCrumb>

        <MallEyebrow>I will not aces it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isAces ? ACES_NOTICE_TITLE : ACES_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {ACES_TABLE_LINE} {ACES_LOT_LINE} {ACES_FLUOR_LINE}{" "}
            {ACES_WALK_LINE} {ACES_STAYS_LINE} {ACES_STILL_LINE}{" "}
            {ACES_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-aces-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isAces ? (
              <Badge variant="outline">I will not aces it</Badge>
            ) : (
              <Badge variant="ghost">Aces not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Aces paper
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
            {sheet.isAces
              ? "Still for sale. Seller taped the aces note. Status stays available. Not a color shop. Not an account."
              : "Still a parking lot. Still fluorescent. Tape it when walkers still want a shop ACES IDT."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isAces ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not aces it"
              title={ACES_NOTICE_TITLE}
              body={`${ACES_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingAcesEmpty listingId={sheet.listingId} />
          )}

          <AcesForm listingId={sheet.listingId} isAces={sheet.isAces} />

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
