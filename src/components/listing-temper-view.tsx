import Link from "next/link";

import { ListingTemperEmpty } from "@/components/listing-temper-empty";
import { SyncTemper } from "@/components/listing-temper-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  TEMPER_LEAVE_LINE,
  TEMPER_METAL_LINE,
  TEMPER_MIRROR_SCRIPT,
  TEMPER_NOTICE_TITLE,
  TEMPER_REFUSE_COPY,
  TEMPER_SPLAYED_LINE,
  TEMPER_STAYS_LINE,
  TEMPER_STILL_LINE,
  TEMPER_TABLE_LINE,
  TEMPER_TOTE_LINE,
  TEMPER_WALK_LINE,
} from "@/lib/listing-temper";
import { listingPath, listingTemperWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type TemperViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "mug"
  | "lid"
  | "owned";

export type TemperViewSheet = {
  kind: TemperViewKind;
  listingId: string;
  isTemper: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function TemperMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={TEMPER_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function TemperRefused({ sheet }: { sheet: TemperViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const mug = sheet.kind === "mug";
  const lid = sheet.kind === "lid";
  const owned = sheet.kind === "owned";

  return (
    <div data-temper-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : mug
                ? "A mug is not a temper"
                : lid
                  ? "A lid is not a temper"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={TEMPER_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A temper note is for the balloon whisk on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {TEMPER_TABLE_LINE} {TEMPER_SPLAYED_LINE} {TEMPER_METAL_LINE}{" "}
              {TEMPER_STILL_LINE}
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

function TemperForm({
  listingId,
  isTemper,
}: {
  listingId: string;
  isTemper: boolean;
}) {
  return (
    <form
      method="post"
      action={listingTemperWritePath()}
      className="space-y-3"
      data-temper-form={isTemper ? "open" : "temper"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isTemper ? "open" : "temper"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/temper`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isTemper ? TEMPER_LEAVE_LINE : TEMPER_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isTemper
          ? "Clear the tape. Status and the tote stay put."
          : `${TEMPER_STAYS_LINE} ${TEMPER_SPLAYED_LINE} ${TEMPER_METAL_LINE} ${TEMPER_STILL_LINE} ${TEMPER_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingTemperView({
  sheet,
  temperIds,
}: {
  sheet: TemperViewSheet;
  temperIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <TemperMissing />;
  }

  if (sheet.kind !== "physical") {
    return <TemperRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-temper-sheet="physical"
      data-temper-state={sheet.isTemper ? "temper" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: TEMPER_MIRROR_SCRIPT }} />
      <SyncTemper listingIds={temperIds} />

      <MallHero>
        <MallCrumb label="I will not temper it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Temper</span>
        </MallCrumb>

        <MallEyebrow>I will not temper it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isTemper ? TEMPER_NOTICE_TITLE : TEMPER_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {TEMPER_TABLE_LINE} {TEMPER_SPLAYED_LINE} {TEMPER_METAL_LINE}{" "}
            {TEMPER_WALK_LINE} {TEMPER_STAYS_LINE} {TEMPER_STILL_LINE}{" "}
            {TEMPER_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-temper-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isTemper ? (
              <Badge variant="outline">I will not temper it</Badge>
            ) : (
              <Badge variant="ghost">Temper not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Temper paper
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
            {sheet.isTemper
              ? "Still for sale. Seller taped the temper note. Status stays available. Not a forge."
              : "Still splayed. Still metal. Tape it when walkers still want the spring set."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isTemper ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not temper it"
              title={TEMPER_NOTICE_TITLE}
              body={`${TEMPER_STILL_LINE} avail=open still lists this whisk.`}
            />
          ) : (
            <ListingTemperEmpty listingId={sheet.listingId} />
          )}

          <TemperForm listingId={sheet.listingId} isTemper={sheet.isTemper} />

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
