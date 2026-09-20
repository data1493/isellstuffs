import Link from "next/link";

import { ListingStamperEmpty } from "@/components/listing-stamper-empty";
import { SyncStamper } from "@/components/listing-stamper-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  STAMPER_JEWEL_LINE,
  STAMPER_LEAVE_LINE,
  STAMPER_MIRROR_SCRIPT,
  STAMPER_NOTICE_TITLE,
  STAMPER_REFUSE_COPY,
  STAMPER_SHARPIE_LINE,
  STAMPER_STAYS_LINE,
  STAMPER_STILL_LINE,
  STAMPER_TABLE_LINE,
  STAMPER_TOTE_LINE,
  STAMPER_WALK_LINE,
} from "@/lib/listing-stamper";
import { listingPath, listingStamperWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type StamperViewKind =
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

export type StamperViewSheet = {
  kind: StamperViewKind;
  listingId: string;
  isStamper: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function StamperMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={STAMPER_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function StamperRefused({ sheet }: { sheet: StamperViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const pack = sheet.kind === "pack";
  const mixtape = sheet.kind === "mixtape";
  const font = sheet.kind === "font";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-stamper-sheet={sheet.kind}>
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
        title={STAMPER_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A stamper note is for the burned disc on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {STAMPER_TABLE_LINE} {STAMPER_SHARPIE_LINE} {STAMPER_JEWEL_LINE}{" "}
              {STAMPER_STILL_LINE}
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

function StamperForm({
  listingId,
  isStamper,
}: {
  listingId: string;
  isStamper: boolean;
}) {
  return (
    <form
      method="post"
      action={listingStamperWritePath()}
      className="space-y-3"
      data-stamper-form={isStamper ? "open" : "stamper"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isStamper ? "open" : "stamper"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/stamper`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isStamper ? STAMPER_LEAVE_LINE : STAMPER_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isStamper
          ? "Clear the tape. Status and the tote stay put."
          : `${STAMPER_STAYS_LINE} ${STAMPER_SHARPIE_LINE} ${STAMPER_JEWEL_LINE} ${STAMPER_STILL_LINE} ${STAMPER_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingStamperView({
  sheet,
  stamperIds,
}: {
  sheet: StamperViewSheet;
  stamperIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <StamperMissing />;
  }

  if (sheet.kind !== "physical") {
    return <StamperRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-stamper-sheet="physical"
      data-stamper-state={sheet.isStamper ? "stamper" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: STAMPER_MIRROR_SCRIPT }} />
      <SyncStamper listingIds={stamperIds} />

      <MallHero>
        <MallCrumb label="I will not stamper it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Stamper</span>
        </MallCrumb>

        <MallEyebrow>I will not stamper it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isStamper ? STAMPER_NOTICE_TITLE : STAMPER_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {STAMPER_TABLE_LINE} {STAMPER_SHARPIE_LINE} {STAMPER_JEWEL_LINE}{" "}
            {STAMPER_WALK_LINE} {STAMPER_STAYS_LINE} {STAMPER_STILL_LINE}{" "}
            {STAMPER_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-stamper-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isStamper ? (
              <Badge variant="outline">I will not stamper it</Badge>
            ) : (
              <Badge variant="ghost">Stamper not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Stamper paper
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
            {sheet.isStamper
              ? "Still for sale. Seller taped the stamper note. Status stays available. Not a shop."
              : "Still Sharpie. Still a jewel case. Tape it when walkers still want a shop pressed father."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isStamper ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not stamper it"
              title={STAMPER_NOTICE_TITLE}
              body={`${STAMPER_STILL_LINE} avail=open still lists this disc.`}
            />
          ) : (
            <ListingStamperEmpty listingId={sheet.listingId} />
          )}

          <StamperForm listingId={sheet.listingId} isStamper={sheet.isStamper} />

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
