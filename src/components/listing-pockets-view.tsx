import Link from "next/link";

import { SyncPockets } from "@/components/listing-pockets-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  POCKETS_DIG_LINE,
  POCKETS_EMPTY_LINE,
  POCKETS_LOST_LINE,
  POCKETS_MIRROR_SCRIPT,
  POCKETS_REFUSE_COPY,
  POCKETS_STILL_LINE,
  POCKETS_TABLE_LINE,
  POCKETS_TOTE_LINE,
} from "@/lib/listing-pockets";
import { listingPath, listingPocketsWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type PocketsViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type PocketsViewSheet = {
  kind: PocketsViewKind;
  listingId: string;
  isEmpty: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function PocketsMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={POCKETS_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function PocketsRefused({ sheet }: { sheet: PocketsViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <MallNotice
      tone="empty"
      eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
      title={POCKETS_REFUSE_COPY}
      body={
        <div className="space-y-2" data-pockets-sheet={sheet.kind}>
          <p>
            {sheet.fact ? (
              <>
                <span className="font-medium text-foreground">{sheet.fact}</span>
                {sheet.stallName ? <> · {sheet.stallName}</> : null}
              </>
            ) : (
              "Pocket honesty is for a jacket on the table, not a PDF and not a gift code."
            )}
          </p>
          <p>
            {POCKETS_TABLE_LINE} {POCKETS_STILL_LINE}
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
  );
}

function PocketsForm({
  listingId,
  isEmpty,
}: {
  listingId: string;
  isEmpty: boolean;
}) {
  return (
    <form
      method="post"
      action={listingPocketsWritePath()}
      className="space-y-3"
      data-pockets-form={isEmpty ? "open" : "empty"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isEmpty ? "open" : "empty"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/pockets`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isEmpty ? "They can dig" : "Pockets are empty"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isEmpty
          ? "Clear the check. Status and the tote stay put."
          : `${POCKETS_STILL_LINE} ${POCKETS_TOTE_LINE} ${POCKETS_DIG_LINE}`}
      </p>
    </form>
  );
}

export function ListingPocketsView({
  sheet,
  pocketsIds,
}: {
  sheet: PocketsViewSheet;
  pocketsIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <PocketsMissing />;
  }

  if (sheet.kind !== "physical") {
    return <PocketsRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-pockets-sheet="physical"
      data-pockets-state={sheet.isEmpty ? "empty" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: POCKETS_MIRROR_SCRIPT }} />
      <SyncPockets listingIds={pocketsIds} />

      <MallHero>
        <MallCrumb label="Pockets are empty">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Pockets</span>
        </MallCrumb>

        <MallEyebrow>Garment honesty</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isEmpty ? POCKETS_TABLE_LINE : "Pockets are empty."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {POCKETS_TABLE_LINE} {POCKETS_STILL_LINE} {POCKETS_TOTE_LINE}{" "}
            {POCKETS_DIG_LINE} {POCKETS_LOST_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-pockets-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isEmpty ? (
              <Badge variant="outline">Pockets empty</Badge>
            ) : (
              <Badge variant="ghost">They can dig</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Pocket tag
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
            {sheet.isEmpty
              ? "Still for sale. Seller checked the pockets. Walkers still dig. Status stays available."
              : "Walkers still dig the jacket. Tape the check when you emptied the pockets yourself."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isEmpty ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Pockets empty"
              title={POCKETS_TABLE_LINE}
              body={`${POCKETS_STILL_LINE} avail=open still lists this pile. ${POCKETS_LOST_LINE}`}
            />
          ) : (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="They can dig"
              title={POCKETS_EMPTY_LINE}
              body="Tape a check when you emptied the pockets. It does not drop the tote or mark it sold."
            />
          )}

          <PocketsForm listingId={sheet.listingId} isEmpty={sheet.isEmpty} />

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
