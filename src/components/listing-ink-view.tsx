import Link from "next/link";

import { ListingInkEmpty } from "@/components/listing-ink-empty";
import { SyncInk } from "@/components/listing-ink-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  INK_HAND_LINE,
  INK_MIRROR_SCRIPT,
  INK_PLAYS_LINE,
  INK_REFUSE_COPY,
  INK_SONGS_LINE,
  INK_STILL_LINE,
  INK_TABLE_LINE,
  INK_TOTE_LINE,
} from "@/lib/listing-ink";
import { listingInkWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type InkViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type InkViewSheet = {
  kind: InkViewKind;
  listingId: string;
  isInk: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function InkMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={INK_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function InkRefused({ sheet }: { sheet: InkViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-ink-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={INK_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Sharpie honesty is for the BEATS 07 CD-R on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {INK_TABLE_LINE} {INK_PLAYS_LINE} {INK_SONGS_LINE} {INK_HAND_LINE}{" "}
              {INK_STILL_LINE}
            </p>
          </div>
        }
        actions={
          <>
            {sheet.listing ? (
              <Button
                className="rounded-full px-5"
                render={<Link href={listingPath(sheet.listing.id)} />}
              >
                Back to the listing
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="rounded-full px-5"
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

function InkForm({
  listingId,
  isInk,
}: {
  listingId: string;
  isInk: boolean;
}) {
  return (
    <form
      method="post"
      action={listingInkWritePath()}
      className="space-y-3"
      data-ink-form={isInk ? "open" : "ink"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isInk ? "open" : "ink"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/ink`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isInk ? "The Sharpie is off the tape" : "The Sharpie stays"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isInk
          ? "Clear the tape. Status, the title, and the tote stay put."
          : `${INK_HAND_LINE} ${INK_STILL_LINE} ${INK_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingInkView({
  sheet,
  inkIds,
}: {
  sheet: InkViewSheet;
  inkIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <InkMissing />;
  }

  if (sheet.kind !== "physical") {
    return <InkRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-ink-sheet="physical"
      data-ink-state={sheet.isInk ? "ink" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: INK_MIRROR_SCRIPT }} />
      <SyncInk listingIds={inkIds} />

      <MallHero>
        <MallCrumb label="The Sharpie stays">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Sharpie</span>
        </MallCrumb>

        <MallEyebrow>BEATS 07 handwriting</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isInk ? INK_TABLE_LINE : "The Sharpie stays."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {INK_TABLE_LINE} {INK_PLAYS_LINE} {INK_SONGS_LINE} {INK_HAND_LINE}{" "}
            {INK_STILL_LINE} {INK_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-ink-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isInk ? (
              <Badge variant="outline">The Sharpie stays</Badge>
            ) : (
              <Badge variant="ghost">Sharpie not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Sharpie tag
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
            {sheet.isInk
              ? "Still for sale. Seller taped the Sharpie. The title stays BEATS 07. Status stays available. Not a fourth status."
              : "Plays is I already spun it. Songs is untitled mixtape. Tape the Sharpie when the handwriting already sits on the disc."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isInk ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="The Sharpie stays"
              title={INK_TABLE_LINE}
              body={`${INK_HAND_LINE} ${INK_STILL_LINE} avail=open still lists this disc.`}
            />
          ) : (
            <ListingInkEmpty listingId={sheet.listingId} />
          )}

          <InkForm listingId={sheet.listingId} isInk={sheet.isInk} />

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={listingPath(sheet.listingId)} />}
            >
              Back to the listing
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={exploreHref({ avail: "open" })} />}
            >
              Still here on the concourse
            </Button>
            {stallHref ? (
              <Button
                variant="outline"
                className="w-full rounded-full sm:w-auto"
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
