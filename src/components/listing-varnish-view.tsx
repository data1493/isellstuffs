import Link from "next/link";

import { ListingVarnishEmpty } from "@/components/listing-varnish-empty";
import { SyncVarnish } from "@/components/listing-varnish-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  VARNISH_LEAVE_LINE,
  VARNISH_MIRROR_SCRIPT,
  VARNISH_NOTICE_TITLE,
  VARNISH_PAGE_LINE,
  VARNISH_REFUSE_COPY,
  VARNISH_RULE_LINE,
  VARNISH_STAYS_LINE,
  VARNISH_STILL_LINE,
  VARNISH_TABLE_LINE,
  VARNISH_TOTE_LINE,
  VARNISH_WALK_LINE,
} from "@/lib/listing-varnish";
import { listingPath, listingVarnishWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type VarnishViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "owned";

export type VarnishViewSheet = {
  kind: VarnishViewKind;
  listingId: string;
  isVarnish: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function VarnishMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={VARNISH_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function VarnishRefused({ sheet }: { sheet: VarnishViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const owned = sheet.kind === "owned";

  return (
    <div data-varnish-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : owned
              ? "Another note already owns that one"
              : object
                ? "On the table"
                : "Walked"
        }
        title={VARNISH_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A varnish note is for one junk PDF page, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {VARNISH_TABLE_LINE} {VARNISH_PAGE_LINE} {VARNISH_RULE_LINE}{" "}
              {VARNISH_STILL_LINE}
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

function VarnishForm({
  listingId,
  isVarnish,
}: {
  listingId: string;
  isVarnish: boolean;
}) {
  return (
    <form
      method="post"
      action={listingVarnishWritePath()}
      className="space-y-3"
      data-varnish-form={isVarnish ? "open" : "varnish"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isVarnish ? "open" : "varnish"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/varnish`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isVarnish ? VARNISH_LEAVE_LINE : VARNISH_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isVarnish
          ? "Clear the tape. Status and the tote stay put."
          : `${VARNISH_STAYS_LINE} ${VARNISH_PAGE_LINE} ${VARNISH_RULE_LINE} ${VARNISH_STILL_LINE} ${VARNISH_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingVarnishView({
  sheet,
  varnishIds,
}: {
  sheet: VarnishViewSheet;
  varnishIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <VarnishMissing />;
  }

  if (sheet.kind !== "digital") {
    return <VarnishRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-varnish-sheet="digital"
      data-varnish-state={sheet.isVarnish ? "varnish" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: VARNISH_MIRROR_SCRIPT }} />
      <SyncVarnish listingIds={varnishIds} />

      <MallHero>
        <MallCrumb label="I will not varnish it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Varnish</span>
        </MallCrumb>

        <MallEyebrow>I will not varnish it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isVarnish ? VARNISH_NOTICE_TITLE : VARNISH_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {VARNISH_TABLE_LINE} {VARNISH_PAGE_LINE} {VARNISH_RULE_LINE}{" "}
            {VARNISH_WALK_LINE} {VARNISH_STAYS_LINE} {VARNISH_STILL_LINE}{" "}
            {VARNISH_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-varnish-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isVarnish ? (
              <Badge variant="outline">I will not varnish it</Badge>
            ) : (
              <Badge variant="ghost">Still one page</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Varnish paper
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
            {sheet.isVarnish
              ? "Still for sale. Seller taped the varnish note. Status stays available. Not a print-coat shop."
              : "Still one page. Still a rule of thumb. Tape it when walkers still want the one-pager coated."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isVarnish ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not varnish it"
              title={VARNISH_NOTICE_TITLE}
              body={`${VARNISH_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingVarnishEmpty listingId={sheet.listingId} />
          )}

          <VarnishForm listingId={sheet.listingId} isVarnish={sheet.isVarnish} />

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
