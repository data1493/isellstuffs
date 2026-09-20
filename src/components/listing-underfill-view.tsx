import Link from "next/link";

import { ListingUnderfillEmpty } from "@/components/listing-underfill-empty";
import { SyncUnderfill } from "@/components/listing-underfill-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  UNDERFILL_CRACK_LINE,
  UNDERFILL_LEAVE_LINE,
  UNDERFILL_MIRROR_SCRIPT,
  UNDERFILL_NOTICE_TITLE,
  UNDERFILL_REFUSE_COPY,
  UNDERFILL_STAYS_LINE,
  UNDERFILL_STILL_LINE,
  UNDERFILL_TABLE_LINE,
  UNDERFILL_TETRIS_LINE,
  UNDERFILL_TOTE_LINE,
  UNDERFILL_WALK_LINE,
} from "@/lib/listing-underfill";
import { listingPath, listingUnderfillWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type UnderfillViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "drawer"
  | "lid"
  | "owned";

export type UnderfillViewSheet = {
  kind: UnderfillViewKind;
  listingId: string;
  isUnderfill: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function UnderfillMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={UNDERFILL_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function UnderfillRefused({ sheet }: { sheet: UnderfillViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const drawer = sheet.kind === "drawer";
  const lid = sheet.kind === "lid";
  const owned = sheet.kind === "owned";

  return (
    <div data-underfill-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : drawer
                ? "A drawer is not an underfill"
                : lid
                  ? "A lid is not an underfill"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={UNDERFILL_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "An underfill note is for the cracked Game Boy on the table, not a LUT and not a gift code."
              )}
            </p>
            <p>
              {UNDERFILL_TABLE_LINE} {UNDERFILL_CRACK_LINE} {UNDERFILL_TETRIS_LINE}{" "}
              {UNDERFILL_STILL_LINE}
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

function UnderfillForm({
  listingId,
  isUnderfill,
}: {
  listingId: string;
  isUnderfill: boolean;
}) {
  return (
    <form
      method="post"
      action={listingUnderfillWritePath()}
      className="space-y-3"
      data-underfill-form={isUnderfill ? "open" : "underfill"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isUnderfill ? "open" : "underfill"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/underfill`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isUnderfill ? UNDERFILL_LEAVE_LINE : UNDERFILL_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isUnderfill
          ? "Clear the tape. Status and the tote stay put."
          : `${UNDERFILL_STAYS_LINE} ${UNDERFILL_CRACK_LINE} ${UNDERFILL_TETRIS_LINE} ${UNDERFILL_STILL_LINE} ${UNDERFILL_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingUnderfillView({
  sheet,
  underfillIds,
}: {
  sheet: UnderfillViewSheet;
  underfillIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <UnderfillMissing />;
  }

  if (sheet.kind !== "physical") {
    return <UnderfillRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-underfill-sheet="physical"
      data-underfill-state={sheet.isUnderfill ? "underfill" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: UNDERFILL_MIRROR_SCRIPT }} />
      <SyncUnderfill listingIds={underfillIds} />

      <MallHero>
        <MallCrumb label="I will not underfill it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Underfill</span>
        </MallCrumb>

        <MallEyebrow>I will not underfill it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isUnderfill ? UNDERFILL_NOTICE_TITLE : UNDERFILL_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {UNDERFILL_TABLE_LINE} {UNDERFILL_CRACK_LINE} {UNDERFILL_TETRIS_LINE}{" "}
            {UNDERFILL_WALK_LINE} {UNDERFILL_STAYS_LINE} {UNDERFILL_STILL_LINE}{" "}
            {UNDERFILL_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-underfill-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isUnderfill ? (
              <Badge variant="outline">I will not underfill it</Badge>
            ) : (
              <Badge variant="ghost">Underfill not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Underfill paper
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
            {sheet.isUnderfill
              ? "Still for sale. Seller taped the underfill note. Status stays available. Not a shop epoxy."
              : "Still a crack. Still Tetris. Tape it when walkers still want shop epoxy under the CPU."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isUnderfill ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not underfill it"
              title={UNDERFILL_NOTICE_TITLE}
              body={`${UNDERFILL_STILL_LINE} avail=open still lists this Game Boy.`}
            />
          ) : (
            <ListingUnderfillEmpty listingId={sheet.listingId} />
          )}

          <UnderfillForm listingId={sheet.listingId} isUnderfill={sheet.isUnderfill} />

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
