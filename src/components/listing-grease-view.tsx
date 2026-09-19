import Link from "next/link";

import { ListingGreaseEmpty } from "@/components/listing-grease-empty";
import { SyncGrease } from "@/components/listing-grease-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  GREASE_CARDS_LINE,
  GREASE_MIRROR_SCRIPT,
  GREASE_NOTICE_TITLE,
  GREASE_READABLE_LINE,
  GREASE_REFUSE_COPY,
  GREASE_STILL_LINE,
  GREASE_TABLE_LINE,
  GREASE_TOTE_LINE,
  GREASE_WALK_LINE,
} from "@/lib/listing-grease";
import { listingGreaseWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type GreaseViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type GreaseViewSheet = {
  kind: GreaseViewKind;
  listingId: string;
  isGrease: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function GreaseMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={GREASE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function GreaseRefused({ sheet }: { sheet: GreaseViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-grease-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={GREASE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "The grease stays is for a file on the digital lot, not a mug and not a gift code."
              )}
            </p>
            <p>
              {GREASE_NOTICE_TITLE} {GREASE_WALK_LINE} {GREASE_STILL_LINE}
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

function GreaseForm({
  listingId,
  isGrease,
}: {
  listingId: string;
  isGrease: boolean;
}) {
  return (
    <form
      method="post"
      action={listingGreaseWritePath()}
      className="space-y-3"
      data-grease-form={isGrease ? "open" : "grease"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isGrease ? "open" : "grease"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/grease`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isGrease ? "Leave the grease" : "The grease stays"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isGrease
          ? "Clear the grease paper. Status and the tote stay put."
          : `${GREASE_READABLE_LINE} ${GREASE_WALK_LINE} ${GREASE_STILL_LINE} ${GREASE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingGreaseView({
  sheet,
  greaseIds,
}: {
  sheet: GreaseViewSheet;
  greaseIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <GreaseMissing />;
  }

  if (sheet.kind !== "digital") {
    return <GreaseRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-grease-sheet="digital"
      data-grease-state={sheet.isGrease ? "grease" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: GREASE_MIRROR_SCRIPT }} />
      <SyncGrease listingIds={greaseIds} />

      <MallHero>
        <MallCrumb label="The grease stays">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Grease</span>
        </MallCrumb>

        <MallEyebrow>The grease stays</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isGrease ? GREASE_NOTICE_TITLE : GREASE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {GREASE_NOTICE_TITLE} {GREASE_WALK_LINE} {GREASE_STILL_LINE}{" "}
            {GREASE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-grease-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isGrease ? (
              <Badge variant="outline">The grease stays</Badge>
            ) : (
              <Badge variant="ghost">Still readable</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Grease paper
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
            {sheet.isGrease
              ? "Still for sale. Seller taped that the grease stays. Walkers still ask Sink Drawer for a clean scan. Status stays available."
              : "The grease stays. Tape it when walkers still want a wipe."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isGrease ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="The grease stays"
              title={GREASE_NOTICE_TITLE}
              body={`${GREASE_STILL_LINE} avail=open still lists this file. ${GREASE_READABLE_LINE} ${GREASE_CARDS_LINE}`}
            />
          ) : (
            <ListingGreaseEmpty listingId={sheet.listingId} />
          )}

          <GreaseForm listingId={sheet.listingId} isGrease={sheet.isGrease} />

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
