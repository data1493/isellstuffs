import Link from "next/link";

import { ListingSaucerEmpty } from "@/components/listing-saucer-empty";
import { SyncSaucer } from "@/components/listing-saucer-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  SAUCER_FOR_SALE_LINE,
  SAUCER_MIRROR_SCRIPT,
  SAUCER_MUG_LINE,
  SAUCER_NOTICE_TITLE,
  SAUCER_REFUSE_COPY,
  SAUCER_STAYS_LINE,
  SAUCER_STILL_LINE,
  SAUCER_TABLE_LINE,
  SAUCER_TOTE_LINE,
  SAUCER_WALK_LINE,
} from "@/lib/listing-saucer";
import { listingPath, listingSaucerWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type SaucerViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type SaucerViewSheet = {
  kind: SaucerViewKind;
  listingId: string;
  isSaucer: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function SaucerMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={SAUCER_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function SaucerRefused({ sheet }: { sheet: SaucerViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-saucer-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={SAUCER_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A saucer note is for a diner mug on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {SAUCER_TABLE_LINE} {SAUCER_MUG_LINE} {SAUCER_STILL_LINE}{" "}
              {SAUCER_FOR_SALE_LINE}
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

function SaucerForm({
  listingId,
  isSaucer,
}: {
  listingId: string;
  isSaucer: boolean;
}) {
  return (
    <form
      method="post"
      action={listingSaucerWritePath()}
      className="space-y-3"
      data-saucer-form={isSaucer ? "open" : "saucer"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isSaucer ? "open" : "saucer"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/saucer`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isSaucer ? "Leave the mug open" : "I don't have a saucer"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isSaucer
          ? "Clear the tape. Status and the tote stay put."
          : `${SAUCER_STAYS_LINE} ${SAUCER_MUG_LINE} ${SAUCER_FOR_SALE_LINE} ${SAUCER_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingSaucerView({
  sheet,
  saucerIds,
}: {
  sheet: SaucerViewSheet;
  saucerIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <SaucerMissing />;
  }

  if (sheet.kind !== "physical") {
    return <SaucerRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-saucer-sheet="physical"
      data-saucer-state={sheet.isSaucer ? "saucer" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: SAUCER_MIRROR_SCRIPT }} />
      <SyncSaucer listingIds={saucerIds} />

      <MallHero>
        <MallCrumb label="I don't have a saucer">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Saucer</span>
        </MallCrumb>

        <MallEyebrow>I don't have a saucer</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isSaucer ? SAUCER_NOTICE_TITLE : SAUCER_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SAUCER_TABLE_LINE} {SAUCER_MUG_LINE} {SAUCER_STILL_LINE} {SAUCER_WALK_LINE}{" "}
            {SAUCER_STAYS_LINE} {SAUCER_FOR_SALE_LINE} {SAUCER_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-saucer-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isSaucer ? (
              <Badge variant="outline">I don't have a saucer</Badge>
            ) : (
              <Badge variant="ghost">Saucer not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Saucer paper
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
            {sheet.isSaucer
              ? "Still for sale. Seller taped the saucer note. Status stays available. Not a diner shop."
              : "Mug only. Still a mug. Tape it when walkers still want a diner plate."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isSaucer ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a saucer"
              title={SAUCER_NOTICE_TITLE}
              body={`${SAUCER_FOR_SALE_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingSaucerEmpty listingId={sheet.listingId} />
          )}

          <SaucerForm listingId={sheet.listingId} isSaucer={sheet.isSaucer} />

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
