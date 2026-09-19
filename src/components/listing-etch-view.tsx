import Link from "next/link";

import { ListingEtchEmpty } from "@/components/listing-etch-empty";
import { SyncEtch } from "@/components/listing-etch-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  ETCH_GROOVE_LINE,
  ETCH_MIRROR_SCRIPT,
  ETCH_NOTICE_TITLE,
  ETCH_REFUSE_COPY,
  ETCH_SIDE_LINE,
  ETCH_STAYS_LINE,
  ETCH_STILL_LINE,
  ETCH_TABLE_LINE,
  ETCH_TOTE_LINE,
  ETCH_WALK_LINE,
} from "@/lib/listing-etch";
import { listingEtchWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type EtchViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type EtchViewSheet = {
  kind: EtchViewKind;
  listingId: string;
  isEtch: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function EtchMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={ETCH_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function EtchRefused({ sheet }: { sheet: EtchViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-etch-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={ETCH_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "An etch note is for a record on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {ETCH_TABLE_LINE} {ETCH_GROOVE_LINE} {ETCH_STILL_LINE}
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

function EtchForm({
  listingId,
  isEtch,
}: {
  listingId: string;
  isEtch: boolean;
}) {
  return (
    <form
      method="post"
      action={listingEtchWritePath()}
      className="space-y-3"
      data-etch-form={isEtch ? "open" : "etch"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isEtch ? "open" : "etch"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/etch`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isEtch ? "Leave the skip" : "I will not read the runout"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isEtch
          ? "Clear the tape. Status and the tote stay put."
          : `${ETCH_STAYS_LINE} ${ETCH_GROOVE_LINE} ${ETCH_SIDE_LINE} ${ETCH_STILL_LINE} ${ETCH_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingEtchView({
  sheet,
  etchIds,
}: {
  sheet: EtchViewSheet;
  etchIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <EtchMissing />;
  }

  if (sheet.kind !== "physical") {
    return <EtchRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-etch-sheet="physical"
      data-etch-state={sheet.isEtch ? "etch" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: ETCH_MIRROR_SCRIPT }} />
      <SyncEtch listingIds={etchIds} />

      <MallHero>
        <MallCrumb label="I will not read the runout">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Etch</span>
        </MallCrumb>

        <MallEyebrow>I will not read the runout</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isEtch ? ETCH_NOTICE_TITLE : ETCH_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {ETCH_TABLE_LINE} {ETCH_GROOVE_LINE} {ETCH_WALK_LINE}{" "}
            {ETCH_STAYS_LINE} {ETCH_STILL_LINE} {ETCH_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-etch-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isEtch ? (
              <Badge variant="outline">I will not read the runout</Badge>
            ) : (
              <Badge variant="ghost">Etch not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Etch paper
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
            {sheet.isEtch
              ? "Still for sale. Seller taped the etch note. Status stays available. Not a press."
              : "Groove stays unnamed. Still Side A. Still skips. Tape it when walkers still want the deadwax read."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isEtch ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not read the runout"
              title={ETCH_NOTICE_TITLE}
              body={`${ETCH_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingEtchEmpty listingId={sheet.listingId} />
          )}

          <EtchForm listingId={sheet.listingId} isEtch={sheet.isEtch} />

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
