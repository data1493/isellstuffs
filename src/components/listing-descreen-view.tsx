import Link from "next/link";

import { ListingDescreenEmpty } from "@/components/listing-descreen-empty";
import { SyncDescreen } from "@/components/listing-descreen-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  DESCREEN_CARDS_LINE,
  DESCREEN_GREASE_LINE,
  DESCREEN_LEAVE_LINE,
  DESCREEN_MIRROR_SCRIPT,
  DESCREEN_NOTICE_TITLE,
  DESCREEN_REFUSE_COPY,
  DESCREEN_STAYS_LINE,
  DESCREEN_STILL_LINE,
  DESCREEN_TABLE_LINE,
  DESCREEN_TOTE_LINE,
  DESCREEN_WALK_LINE,
} from "@/lib/listing-descreen";
import { listingDescreenWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type DescreenViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "owned";

export type DescreenViewSheet = {
  kind: DescreenViewKind;
  listingId: string;
  isDescreen: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function DescreenMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={DESCREEN_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function DescreenRefused({ sheet }: { sheet: DescreenViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const owned = sheet.kind === "owned";

  return (
    <div data-descreen-sheet={sheet.kind}>
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
        title={DESCREEN_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A descreen note is for three recipe cards, not a liner and not a gift code."
              )}
            </p>
            <p>
              {DESCREEN_TABLE_LINE} {DESCREEN_CARDS_LINE} {DESCREEN_GREASE_LINE}{" "}
              {DESCREEN_STILL_LINE}
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

function DescreenForm({
  listingId,
  isDescreen,
}: {
  listingId: string;
  isDescreen: boolean;
}) {
  return (
    <form
      method="post"
      action={listingDescreenWritePath()}
      className="space-y-3"
      data-descreen-form={isDescreen ? "open" : "descreen"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isDescreen ? "open" : "descreen"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/descreen`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isDescreen ? DESCREEN_LEAVE_LINE : DESCREEN_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isDescreen
          ? "Clear the tape. Status and the tote stay put."
          : `${DESCREEN_STAYS_LINE} ${DESCREEN_CARDS_LINE} ${DESCREEN_GREASE_LINE} ${DESCREEN_STILL_LINE} ${DESCREEN_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingDescreenView({
  sheet,
  descreenIds,
}: {
  sheet: DescreenViewSheet;
  descreenIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <DescreenMissing />;
  }

  if (sheet.kind !== "digital") {
    return <DescreenRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-descreen-sheet="digital"
      data-descreen-state={sheet.isDescreen ? "descreen" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: DESCREEN_MIRROR_SCRIPT }} />
      <SyncDescreen listingIds={descreenIds} />

      <MallHero>
        <MallCrumb label="I will not descreen them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Descreen</span>
        </MallCrumb>

        <MallEyebrow>I will not descreen them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isDescreen ? DESCREEN_NOTICE_TITLE : DESCREEN_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {DESCREEN_TABLE_LINE} {DESCREEN_CARDS_LINE} {DESCREEN_GREASE_LINE}{" "}
            {DESCREEN_WALK_LINE} {DESCREEN_STAYS_LINE} {DESCREEN_STILL_LINE}{" "}
            {DESCREEN_TOTE_LINE} Pull the print dots, not a login.
            Register stays print bars.
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-descreen-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isDescreen ? (
              <Badge variant="outline">I will not descreen them</Badge>
            ) : (
              <Badge variant="ghost">Still three cards</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Descreen paper
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
            {sheet.isDescreen
              ? "Still for sale. Seller taped the descreen note. Status stays available. Not a shop descreen."
              : "Still three cards. Still grease. Tape it when walkers still want the print dots pulled."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isDescreen ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not descreen them"
              title={DESCREEN_NOTICE_TITLE}
              body={`${DESCREEN_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingDescreenEmpty listingId={sheet.listingId} />
          )}

          <DescreenForm listingId={sheet.listingId} isDescreen={sheet.isDescreen} />

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
