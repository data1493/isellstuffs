import Link from "next/link";

import { ListingKnurlEmpty } from "@/components/listing-knurl-empty";
import { SyncKnurl } from "@/components/listing-knurl-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  KNURL_LEAVE_LINE,
  KNURL_LID_LINE,
  KNURL_LOOSE_LINE,
  KNURL_MIRROR_SCRIPT,
  KNURL_NOTICE_TITLE,
  KNURL_REFUSE_COPY,
  KNURL_STAYS_LINE,
  KNURL_STILL_LINE,
  KNURL_TABLE_LINE,
  KNURL_TOTE_LINE,
  KNURL_WALK_LINE,
} from "@/lib/listing-knurl";
import { listingKnurlWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type KnurlViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type KnurlViewSheet = {
  kind: KnurlViewKind;
  listingId: string;
  isKnurl: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function KnurlMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={KNURL_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function KnurlRefused({ sheet }: { sheet: KnurlViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-knurl-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={KNURL_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A knurl note is for a pot lid on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {KNURL_TABLE_LINE} {KNURL_LOOSE_LINE} {KNURL_LID_LINE} {KNURL_STILL_LINE}
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

function KnurlForm({
  listingId,
  isKnurl,
}: {
  listingId: string;
  isKnurl: boolean;
}) {
  return (
    <form
      method="post"
      action={listingKnurlWritePath()}
      className="space-y-3"
      data-knurl-form={isKnurl ? "open" : "knurl"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isKnurl ? "open" : "knurl"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/knurl`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isKnurl ? KNURL_LEAVE_LINE : KNURL_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isKnurl
          ? "Clear the tape. Status and the tote stay put."
          : `${KNURL_STAYS_LINE} ${KNURL_LOOSE_LINE} ${KNURL_LID_LINE} ${KNURL_STILL_LINE} ${KNURL_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingKnurlView({
  sheet,
  knurlIds,
}: {
  sheet: KnurlViewSheet;
  knurlIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <KnurlMissing />;
  }

  if (sheet.kind !== "physical") {
    return <KnurlRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-knurl-sheet="physical"
      data-knurl-state={sheet.isKnurl ? "knurl" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: KNURL_MIRROR_SCRIPT }} />
      <SyncKnurl listingIds={knurlIds} />

      <MallHero>
        <MallCrumb label="I will not knurl it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Knurl</span>
        </MallCrumb>

        <MallEyebrow>I will not knurl it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isKnurl ? KNURL_NOTICE_TITLE : KNURL_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {KNURL_TABLE_LINE} {KNURL_LOOSE_LINE} {KNURL_LID_LINE} {KNURL_WALK_LINE}{" "}
            {KNURL_STAYS_LINE} {KNURL_STILL_LINE} {KNURL_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-knurl-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isKnurl ? (
              <Badge variant="outline">I will not knurl it</Badge>
            ) : (
              <Badge variant="ghost">Knurl not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Knurl paper
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
            {sheet.isKnurl
              ? "Still for sale. Seller taped the knurl note. Status stays available. Not a shop."
              : "Still loose. Still a lid. Tape it when walkers still want the knob knurled."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isKnurl ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not knurl it"
              title={KNURL_NOTICE_TITLE}
              body={`${KNURL_STILL_LINE} avail=open still lists this lid.`}
            />
          ) : (
            <ListingKnurlEmpty listingId={sheet.listingId} />
          )}

          <KnurlForm listingId={sheet.listingId} isKnurl={sheet.isKnurl} />

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
