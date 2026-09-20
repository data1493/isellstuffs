import Link from "next/link";

import { ListingPcltEmpty } from "@/components/listing-pclt-empty";
import { SyncPclt } from "@/components/listing-pclt-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  PCLT_BOLD_LINE,
  PCLT_LEAVE_LINE,
  PCLT_MIRROR_SCRIPT,
  PCLT_NOTICE_TITLE,
  PCLT_REFUSE_COPY,
  PCLT_STAYS_LINE,
  PCLT_STILL_LINE,
  PCLT_TABLE_LINE,
  PCLT_TOTE_LINE,
  PCLT_WALK_LINE,
  PCLT_WEIGHTS_LINE,
} from "@/lib/listing-pclt";
import { listingPath, listingPcltWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type PcltViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "pack"
  | "pdf"
  | "chair"
  | "owned";

export type PcltViewSheet = {
  kind: PcltViewKind;
  listingId: string;
  isPclt: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function PcltMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={PCLT_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function PcltRefused({ sheet }: { sheet: PcltViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const pack = sheet.kind === "pack";
  const pdf = sheet.kind === "pdf";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-pclt-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : pack
              ? "A pack is not a font"
              : pdf
                ? "A junk PDF is not a font"
                : chair
                  ? "A chair is not a font"
                  : owned
                    ? "Another note already owns that one"
                    : object
                      ? "On the table"
                      : "Walked"
        }
        title={PCLT_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A pclt note is for the booth font, not a pack and not a gift code."
              )}
            </p>
            <p>
              {PCLT_TABLE_LINE} {PCLT_WEIGHTS_LINE} {PCLT_BOLD_LINE}{" "}
              {PCLT_STILL_LINE}
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

function PcltForm({
  listingId,
  isPclt,
}: {
  listingId: string;
  isPclt: boolean;
}) {
  return (
    <form
      method="post"
      action={listingPcltWritePath()}
      className="space-y-3"
      data-pclt-form={isPclt ? "open" : "pclt"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isPclt ? "open" : "pclt"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/pclt`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isPclt ? PCLT_LEAVE_LINE : PCLT_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isPclt
          ? "Clear the tape. Status and the tote stay put."
          : `${PCLT_STAYS_LINE} ${PCLT_WEIGHTS_LINE} ${PCLT_BOLD_LINE} ${PCLT_STILL_LINE} ${PCLT_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingPcltView({
  sheet,
  pcltIds,
}: {
  sheet: PcltViewSheet;
  pcltIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <PcltMissing />;
  }

  if (sheet.kind !== "digital") {
    return <PcltRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-pclt-sheet="digital"
      data-pclt-state={sheet.isPclt ? "pclt" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: PCLT_MIRROR_SCRIPT }} />
      <SyncPclt listingIds={pcltIds} />

      <MallHero>
        <MallCrumb label="I will not pclt it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Pclt</span>
        </MallCrumb>

        <MallEyebrow>I will not pclt it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isPclt ? PCLT_NOTICE_TITLE : PCLT_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {PCLT_TABLE_LINE} {PCLT_WEIGHTS_LINE} {PCLT_BOLD_LINE}{" "}
            {PCLT_WALK_LINE} {PCLT_STAYS_LINE} {PCLT_STILL_LINE}{" "}
            {PCLT_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-pclt-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isPclt ? (
              <Badge variant="outline">I will not pclt it</Badge>
            ) : (
              <Badge variant="ghost">Pclt not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Pclt paper
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
            {sheet.isPclt
              ? "Still for sale. Seller taped the pclt note. Status stays available. Not a type shop."
              : "Still two weights. Still almost-bold. Tape it when walkers still want a shop PCL 5 table."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isPclt ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not pclt it"
              title={PCLT_NOTICE_TITLE}
              body={`${PCLT_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingPcltEmpty listingId={sheet.listingId} />
          )}

          <PcltForm listingId={sheet.listingId} isPclt={sheet.isPclt} />

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
