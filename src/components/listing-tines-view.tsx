import Link from "next/link";

import { ListingTinesEmpty } from "@/components/listing-tines-empty";
import { SyncTines } from "@/components/listing-tines-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  TINES_METAL_LINE,
  TINES_MIRROR_SCRIPT,
  TINES_NOTICE_TITLE,
  TINES_REFUSE_COPY,
  TINES_SPLAY_LINE,
  TINES_STAYS_LINE,
  TINES_STILL_LINE,
  TINES_TABLE_LINE,
  TINES_TOTE_LINE,
  TINES_WALK_LINE,
} from "@/lib/listing-tines";
import { listingPath, listingTinesWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type TinesViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type TinesViewSheet = {
  kind: TinesViewKind;
  listingId: string;
  isTines: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function TinesMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={TINES_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function TinesRefused({ sheet }: { sheet: TinesViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-tines-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={TINES_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A tines refusal is for a whisk on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {TINES_TABLE_LINE} {TINES_SPLAY_LINE} {TINES_METAL_LINE}{" "}
              {TINES_STILL_LINE}
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

function TinesForm({
  listingId,
  isTines,
}: {
  listingId: string;
  isTines: boolean;
}) {
  return (
    <form
      method="post"
      action={listingTinesWritePath()}
      className="space-y-3"
      data-tines-form={isTines ? "open" : "tines"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isTines ? "open" : "tines"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/tines`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isTines ? "Leave the splay" : "I will not replace a tine"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isTines
          ? "Clear the tines paper. Status and the tote stay put."
          : `${TINES_NOTICE_TITLE} ${TINES_STAYS_LINE} ${TINES_STILL_LINE} ${TINES_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingTinesView({
  sheet,
  tinesIds,
}: {
  sheet: TinesViewSheet;
  tinesIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <TinesMissing />;
  }

  if (sheet.kind !== "physical") {
    return <TinesRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-tines-sheet="physical"
      data-tines-state={sheet.isTines ? "tines" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: TINES_MIRROR_SCRIPT }} />
      <SyncTines listingIds={tinesIds} />

      <MallHero>
        <MallCrumb label="I will not replace a tine">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Tines</span>
        </MallCrumb>

        <MallEyebrow>I will not replace a tine</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isTines ? TINES_NOTICE_TITLE : TINES_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {TINES_TABLE_LINE} {TINES_SPLAY_LINE} {TINES_METAL_LINE}{" "}
            {TINES_WALK_LINE} {TINES_STAYS_LINE} {TINES_STILL_LINE}{" "}
            {TINES_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-tines-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isTines ? (
              <Badge variant="outline">I will not replace a tine</Badge>
            ) : (
              <Badge variant="ghost">Tines not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Tines paper
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
            {sheet.isTines
              ? "Still for sale. Seller will not replace a wire. Status stays available. Not a parts counter."
              : "Wires splay. Still metal. Tape it when walkers want a spare tine or a balloon again."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isTines ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not replace a tine"
              title={TINES_NOTICE_TITLE}
              body={`${TINES_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingTinesEmpty listingId={sheet.listingId} />
          )}

          <TinesForm listingId={sheet.listingId} isTines={sheet.isTines} />

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
