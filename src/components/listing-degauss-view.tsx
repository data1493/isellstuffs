import Link from "next/link";

import { ListingDegaussEmpty } from "@/components/listing-degauss-empty";
import { SyncDegauss } from "@/components/listing-degauss-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  DEGAUSS_HISS_LINE,
  DEGAUSS_INK_LINE,
  DEGAUSS_LEAVE_LINE,
  DEGAUSS_MIRROR_SCRIPT,
  DEGAUSS_NOTICE_TITLE,
  DEGAUSS_REFUSE_COPY,
  DEGAUSS_STAYS_LINE,
  DEGAUSS_STILL_LINE,
  DEGAUSS_TABLE_LINE,
  DEGAUSS_TOTE_LINE,
  DEGAUSS_WALK_LINE,
} from "@/lib/listing-degauss";
import { listingDegaussWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type DegaussViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "lp"
  | "owned";

export type DegaussViewSheet = {
  kind: DegaussViewKind;
  listingId: string;
  isDegauss: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function DegaussMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={DEGAUSS_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function DegaussRefused({ sheet }: { sheet: DegaussViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const lp = sheet.kind === "lp";
  const owned = sheet.kind === "owned";

  return (
    <div data-degauss-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : lp
                ? "A record is not a cassette"
                : owned
                  ? "Another note already owns that one"
                  : "Walked"
        }
        title={DEGAUSS_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A degauss note is for SUMMER 93 on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {DEGAUSS_TABLE_LINE} {DEGAUSS_HISS_LINE} {DEGAUSS_INK_LINE}{" "}
              {DEGAUSS_STILL_LINE}
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

function DegaussForm({
  listingId,
  isDegauss,
}: {
  listingId: string;
  isDegauss: boolean;
}) {
  return (
    <form
      method="post"
      action={listingDegaussWritePath()}
      className="space-y-3"
      data-degauss-form={isDegauss ? "open" : "degauss"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isDegauss ? "open" : "degauss"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/degauss`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isDegauss ? DEGAUSS_LEAVE_LINE : DEGAUSS_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isDegauss
          ? "Clear the tape. Status and the tote stay put."
          : `${DEGAUSS_STAYS_LINE} ${DEGAUSS_HISS_LINE} ${DEGAUSS_INK_LINE} ${DEGAUSS_STILL_LINE} ${DEGAUSS_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingDegaussView({
  sheet,
  degaussIds,
}: {
  sheet: DegaussViewSheet;
  degaussIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <DegaussMissing />;
  }

  if (sheet.kind !== "physical") {
    return <DegaussRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-degauss-sheet="physical"
      data-degauss-state={sheet.isDegauss ? "degauss" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: DEGAUSS_MIRROR_SCRIPT }} />
      <SyncDegauss listingIds={degaussIds} />

      <MallHero>
        <MallCrumb label="I will not degauss it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Degauss</span>
        </MallCrumb>

        <MallEyebrow>I will not degauss it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isDegauss ? DEGAUSS_NOTICE_TITLE : DEGAUSS_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {DEGAUSS_TABLE_LINE} {DEGAUSS_HISS_LINE} {DEGAUSS_INK_LINE}{" "}
            {DEGAUSS_WALK_LINE} {DEGAUSS_STAYS_LINE} {DEGAUSS_STILL_LINE}{" "}
            {DEGAUSS_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-degauss-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isDegauss ? (
              <Badge variant="outline">I will not degauss it</Badge>
            ) : (
              <Badge variant="ghost">Degauss not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Degauss paper
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
            {sheet.isDegauss
              ? "Still for sale. Seller taped the degauss note. Status stays available. Not a shop."
              : "Still hiss. Still fading ink. Tape it when walkers still want the cassette wiped."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isDegauss ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not degauss it"
              title={DEGAUSS_NOTICE_TITLE}
              body={`${DEGAUSS_STILL_LINE} avail=open still lists this tape.`}
            />
          ) : (
            <ListingDegaussEmpty listingId={sheet.listingId} />
          )}

          <DegaussForm listingId={sheet.listingId} isDegauss={sheet.isDegauss} />

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
