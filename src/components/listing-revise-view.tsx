import Link from "next/link";

import { ListingReviseEmpty } from "@/components/listing-revise-empty";
import { SyncRevise } from "@/components/listing-revise-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  REVISE_MIRROR_SCRIPT,
  REVISE_NOTICE_TITLE,
  REVISE_ONE_LINE,
  REVISE_PAGE_LINE,
  REVISE_REFUSE_COPY,
  REVISE_STILL_LINE,
  REVISE_TABLE_LINE,
  REVISE_TOTE_LINE,
  REVISE_WALK_LINE,
} from "@/lib/listing-revise";
import { listingPath, listingReviseWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type ReviseViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type ReviseViewSheet = {
  kind: ReviseViewKind;
  listingId: string;
  isRevise: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function ReviseMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={REVISE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button
          className="h-11 w-full rounded-full px-5 sm:w-auto"
          render={<Link href="/explore" />}
        >
          Walk the concourse
        </Button>
      }
    />
  );
}

function ReviseRefused({ sheet }: { sheet: ReviseViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-revise-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={REVISE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "I will not revise is for a file on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {REVISE_NOTICE_TITLE} {REVISE_WALK_LINE} {REVISE_STILL_LINE}
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

function ReviseForm({
  listingId,
  isRevise,
}: {
  listingId: string;
  isRevise: boolean;
}) {
  return (
    <form
      method="post"
      action={listingReviseWritePath()}
      className="space-y-3"
      data-revise-form={isRevise ? "open" : "revise"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isRevise ? "open" : "revise"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/revise`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isRevise ? "Leave the page" : "I will not revise"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isRevise
          ? "Clear the revise paper. Status and the tote stay put."
          : `${REVISE_PAGE_LINE} ${REVISE_ONE_LINE} ${REVISE_WALK_LINE} ${REVISE_STILL_LINE} ${REVISE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingReviseView({
  sheet,
  reviseIds,
}: {
  sheet: ReviseViewSheet;
  reviseIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <ReviseMissing />;
  }

  if (sheet.kind !== "digital") {
    return <ReviseRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-revise-sheet="digital"
      data-revise-state={sheet.isRevise ? "revise" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: REVISE_MIRROR_SCRIPT }} />
      <SyncRevise listingIds={reviseIds} />

      <MallHero>
        <MallCrumb label="I will not revise">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Revise</span>
        </MallCrumb>

        <MallEyebrow>I will not revise</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isRevise ? REVISE_NOTICE_TITLE : REVISE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {REVISE_NOTICE_TITLE} {REVISE_WALK_LINE} {REVISE_STILL_LINE}{" "}
            {REVISE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-revise-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isRevise ? (
              <Badge variant="outline">I will not revise</Badge>
            ) : (
              <Badge variant="ghost">Still one page</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Revise paper
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
            {sheet.isRevise
              ? "Still for sale. Seller taped that the page stays one page. Walkers still ask Tuesday for this year’s numbers. Status stays available."
              : "Written on a folding table. Tape it when walkers still want this year’s numbers."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isRevise ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not revise"
              title={REVISE_NOTICE_TITLE}
              body={`${REVISE_STILL_LINE} avail=open still lists this file. ${REVISE_ONE_LINE}`}
            />
          ) : (
            <ListingReviseEmpty listingId={sheet.listingId} />
          )}

          <ReviseForm listingId={sheet.listingId} isRevise={sheet.isRevise} />

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
