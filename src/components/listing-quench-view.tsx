import Link from "next/link";

import { ListingQuenchEmpty } from "@/components/listing-quench-empty";
import { SyncQuench } from "@/components/listing-quench-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  QUENCH_LEAVE_LINE,
  QUENCH_MIRROR_SCRIPT,
  QUENCH_NOTICE_TITLE,
  QUENCH_REFUSE_COPY,
  QUENCH_SPLAY_LINE,
  QUENCH_STAYS_LINE,
  QUENCH_STILL_LINE,
  QUENCH_TABLE_LINE,
  QUENCH_TOTE_LINE,
  QUENCH_WALK_LINE,
  QUENCH_WHISK_LINE,
} from "@/lib/listing-quench";
import { listingPath, listingQuenchWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type QuenchViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "mug"
  | "lid"
  | "owned";

export type QuenchViewSheet = {
  kind: QuenchViewKind;
  listingId: string;
  isQuench: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function QuenchMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={QUENCH_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function QuenchRefused({ sheet }: { sheet: QuenchViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const mug = sheet.kind === "mug";
  const lid = sheet.kind === "lid";
  const owned = sheet.kind === "owned";

  return (
    <div data-quench-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : mug
                ? "A mug is not a quench"
                : lid
                  ? "A lid is not a quench"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={QUENCH_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A quench note is for the balloon whisk on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {QUENCH_TABLE_LINE} {QUENCH_SPLAY_LINE} {QUENCH_WHISK_LINE}{" "}
              {QUENCH_STILL_LINE}
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

function QuenchForm({
  listingId,
  isQuench,
}: {
  listingId: string;
  isQuench: boolean;
}) {
  return (
    <form
      method="post"
      action={listingQuenchWritePath()}
      className="space-y-3"
      data-quench-form={isQuench ? "open" : "quench"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isQuench ? "open" : "quench"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/quench`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isQuench ? QUENCH_LEAVE_LINE : QUENCH_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isQuench
          ? "Clear the tape. Status and the tote stay put."
          : `${QUENCH_STAYS_LINE} ${QUENCH_SPLAY_LINE} ${QUENCH_WHISK_LINE} ${QUENCH_STILL_LINE} ${QUENCH_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingQuenchView({
  sheet,
  quenchIds,
}: {
  sheet: QuenchViewSheet;
  quenchIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <QuenchMissing />;
  }

  if (sheet.kind !== "physical") {
    return <QuenchRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-quench-sheet="physical"
      data-quench-state={sheet.isQuench ? "quench" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: QUENCH_MIRROR_SCRIPT }} />
      <SyncQuench listingIds={quenchIds} />

      <MallHero>
        <MallCrumb label="I will not quench it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Quench</span>
        </MallCrumb>

        <MallEyebrow>I will not quench it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isQuench ? QUENCH_NOTICE_TITLE : QUENCH_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {QUENCH_TABLE_LINE} {QUENCH_SPLAY_LINE} {QUENCH_WHISK_LINE}{" "}
            {QUENCH_WALK_LINE} {QUENCH_STAYS_LINE} {QUENCH_STILL_LINE}{" "}
            {QUENCH_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-quench-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isQuench ? (
              <Badge variant="outline">I will not quench it</Badge>
            ) : (
              <Badge variant="ghost">Quench not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Quench paper
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
            {sheet.isQuench
              ? "Still for sale. Seller taped the quench note. Status stays available. Not a shop dunk."
              : "Still a splay. Still a whisk. Tape it when walkers still want the wires dunked."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isQuench ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not quench it"
              title={QUENCH_NOTICE_TITLE}
              body={`${QUENCH_STILL_LINE} avail=open still lists this whisk.`}
            />
          ) : (
            <ListingQuenchEmpty listingId={sheet.listingId} />
          )}

          <QuenchForm listingId={sheet.listingId} isQuench={sheet.isQuench} />

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
