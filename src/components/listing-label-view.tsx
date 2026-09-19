import Link from "next/link";

import { ListingLabelEmpty } from "@/components/listing-label-empty";
import { SyncLabel } from "@/components/listing-label-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  LABEL_MIRROR_SCRIPT,
  LABEL_NOTICE_TITLE,
  LABEL_PILE_LINE,
  LABEL_REFUSE_COPY,
  LABEL_STAYS_LINE,
  LABEL_STILL_LINE,
  LABEL_TABLE_LINE,
  LABEL_TOTE_LINE,
  LABEL_UNTESTED_LINE,
  LABEL_WALK_LINE,
} from "@/lib/listing-label";
import { listingLabelWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type LabelViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type LabelViewSheet = {
  kind: LabelViewKind;
  listingId: string;
  isLabel: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function LabelMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={LABEL_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function LabelRefused({ sheet }: { sheet: LabelViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-label-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={LABEL_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A label note is for a drawer on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {LABEL_TABLE_LINE} {LABEL_PILE_LINE} {LABEL_UNTESTED_LINE}{" "}
              {LABEL_STILL_LINE}
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

function LabelForm({
  listingId,
  isLabel,
}: {
  listingId: string;
  isLabel: boolean;
}) {
  return (
    <form
      method="post"
      action={listingLabelWritePath()}
      className="space-y-3"
      data-label-form={isLabel ? "open" : "label"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isLabel ? "open" : "label"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/label`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isLabel ? "Leave the tangle" : "I will not label them"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isLabel
          ? "Clear the tape. Status and the tote stay put."
          : `${LABEL_STAYS_LINE} ${LABEL_STILL_LINE} ${LABEL_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingLabelView({
  sheet,
  labelIds,
}: {
  sheet: LabelViewSheet;
  labelIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <LabelMissing />;
  }

  if (sheet.kind !== "physical") {
    return <LabelRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-label-sheet="physical"
      data-label-state={sheet.isLabel ? "label" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: LABEL_MIRROR_SCRIPT }} />
      <SyncLabel listingIds={labelIds} />

      <MallHero>
        <MallCrumb label="I will not label them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Label</span>
        </MallCrumb>

        <MallEyebrow>I will not label them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isLabel ? LABEL_NOTICE_TITLE : LABEL_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {LABEL_TABLE_LINE} {LABEL_PILE_LINE} {LABEL_UNTESTED_LINE}{" "}
            {LABEL_WALK_LINE} {LABEL_STAYS_LINE} {LABEL_STILL_LINE}{" "}
            {LABEL_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-label-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isLabel ? (
              <Badge variant="outline">I will not label them</Badge>
            ) : (
              <Badge variant="ghost">Label not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Label paper
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
            {sheet.isLabel
              ? "Still for sale. Seller taped the label note. Status stays available. Not HDMI tape. Not a shop."
              : "Still a pile. Still untested. Tape it when walkers still want HDMI on the tape."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isLabel ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not label them"
              title={LABEL_NOTICE_TITLE}
              body={`${LABEL_STILL_LINE} avail=open still lists this drawer.`}
            />
          ) : (
            <ListingLabelEmpty listingId={sheet.listingId} />
          )}

          <LabelForm listingId={sheet.listingId} isLabel={sheet.isLabel} />

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
