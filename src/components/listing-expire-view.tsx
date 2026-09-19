import Link from "next/link";

import { ListingExpireEmpty } from "@/components/listing-expire-empty";
import { SyncExpire } from "@/components/listing-expire-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  EXPIRE_CREDIT_LINE,
  EXPIRE_MIRROR_SCRIPT,
  EXPIRE_NOTICE_TITLE,
  EXPIRE_REFUSE_COPY,
  EXPIRE_RELOAD_LINE,
  EXPIRE_STILL_LINE,
  EXPIRE_TABLE_LINE,
  EXPIRE_TOTE_LINE,
  EXPIRE_VOID_LINE,
  EXPIRE_WALK_LINE,
} from "@/lib/listing-expire";
import { listingExpireWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type ExpireViewKind =
  | "gift"
  | "physical"
  | "digital"
  | "sold"
  | "file-gone"
  | "missing";

export type ExpireViewSheet = {
  kind: ExpireViewKind;
  listingId: string;
  isExpire: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function ExpireMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={EXPIRE_REFUSE_COPY}
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

function ExpireRefused({ sheet }: { sheet: ExpireViewSheet }) {
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-expire-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={file ? "Files stay in the folder" : object ? "On the table" : "Walked"}
        title={EXPIRE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "I will not expire it is for the mall gift card, not a mug and not a PDF."
              )}
            </p>
            <p>
              {EXPIRE_NOTICE_TITLE} {EXPIRE_RELOAD_LINE} {EXPIRE_WALK_LINE}{" "}
              {EXPIRE_STILL_LINE}
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

function ExpireForm({
  listingId,
  isExpire,
}: {
  listingId: string;
  isExpire: boolean;
}) {
  return (
    <form
      method="post"
      action={listingExpireWritePath()}
      className="space-y-3"
      data-expire-form={isExpire ? "open" : "expire"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isExpire ? "open" : "expire"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/expire`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isExpire ? "Leave the leftover" : "I will not expire it"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isExpire
          ? "Clear the expire paper. Status and the tote stay put."
          : `${EXPIRE_VOID_LINE} ${EXPIRE_CREDIT_LINE} ${EXPIRE_RELOAD_LINE} ${EXPIRE_WALK_LINE} ${EXPIRE_STILL_LINE} ${EXPIRE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingExpireView({
  sheet,
  expireIds,
}: {
  sheet: ExpireViewSheet;
  expireIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <ExpireMissing />;
  }

  if (sheet.kind !== "gift") {
    return <ExpireRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-expire-sheet="gift"
      data-expire-state={sheet.isExpire ? "expire" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: EXPIRE_MIRROR_SCRIPT }} />
      <SyncExpire listingIds={expireIds} />

      <MallHero>
        <MallCrumb label="I will not expire it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Expire</span>
        </MallCrumb>

        <MallEyebrow>I will not expire it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isExpire ? EXPIRE_NOTICE_TITLE : EXPIRE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {EXPIRE_NOTICE_TITLE} {EXPIRE_RELOAD_LINE} {EXPIRE_WALK_LINE}{" "}
            {EXPIRE_STILL_LINE} {EXPIRE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-expire-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">At the desk</MallEyebrow>
            {sheet.isExpire ? (
              <Badge variant="outline">No void date</Badge>
            ) : (
              <Badge variant="ghost">Open leftover</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Expire paper
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
            {sheet.isExpire
              ? "Still credit. Seller taped that the card has no void date. Walkers still ask Gift Desk to kill it Saturday. Status stays available."
              : "No void date. Tape it when walkers still want a Saturday void on the leftover."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isExpire ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not expire it"
              title={EXPIRE_NOTICE_TITLE}
              body={`${EXPIRE_STILL_LINE} avail=open still lists this card. ${EXPIRE_VOID_LINE} ${EXPIRE_CREDIT_LINE}`}
            />
          ) : (
            <ListingExpireEmpty listingId={sheet.listingId} />
          )}

          <ExpireForm listingId={sheet.listingId} isExpire={sheet.isExpire} />

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
