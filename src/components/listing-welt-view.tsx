import Link from "next/link";

import { ListingWeltEmpty } from "@/components/listing-welt-empty";
import { SyncWelt } from "@/components/listing-welt-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  WELT_LEAVE_LINE,
  WELT_MIRROR_SCRIPT,
  WELT_NOTICE_TITLE,
  WELT_PAIR_LINE,
  WELT_PEEL_LINE,
  WELT_REFUSE_COPY,
  WELT_STAYS_LINE,
  WELT_STILL_LINE,
  WELT_TABLE_LINE,
  WELT_TOTE_LINE,
  WELT_WALK_LINE,
} from "@/lib/listing-welt";
import { listingPath, listingWeltWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type WeltViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type WeltViewSheet = {
  kind: WeltViewKind;
  listingId: string;
  isWelt: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function WeltMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={WELT_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function WeltRefused({ sheet }: { sheet: WeltViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-welt-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={WELT_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A welt note is for a pair on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {WELT_TABLE_LINE} {WELT_PEEL_LINE} {WELT_PAIR_LINE} {WELT_STILL_LINE}
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

function WeltForm({
  listingId,
  isWelt,
}: {
  listingId: string;
  isWelt: boolean;
}) {
  return (
    <form
      method="post"
      action={listingWeltWritePath()}
      className="space-y-3"
      data-welt-form={isWelt ? "open" : "welt"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isWelt ? "open" : "welt"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/welt`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isWelt ? WELT_LEAVE_LINE : WELT_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isWelt
          ? "Clear the tape. Status and the tote stay put."
          : `${WELT_STAYS_LINE} ${WELT_PEEL_LINE} ${WELT_PAIR_LINE} ${WELT_STILL_LINE} ${WELT_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingWeltView({
  sheet,
  weltIds,
}: {
  sheet: WeltViewSheet;
  weltIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <WeltMissing />;
  }

  if (sheet.kind !== "physical") {
    return <WeltRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-welt-sheet="physical"
      data-welt-state={sheet.isWelt ? "welt" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: WELT_MIRROR_SCRIPT }} />
      <SyncWelt listingIds={weltIds} />

      <MallHero>
        <MallCrumb label="I will not welt them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Welt</span>
        </MallCrumb>

        <MallEyebrow>I will not welt them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isWelt ? WELT_NOTICE_TITLE : WELT_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {WELT_TABLE_LINE} {WELT_PEEL_LINE} {WELT_PAIR_LINE} {WELT_WALK_LINE}{" "}
            {WELT_STAYS_LINE} {WELT_STILL_LINE} {WELT_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-welt-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isWelt ? (
              <Badge variant="outline">I will not welt them</Badge>
            ) : (
              <Badge variant="ghost">Welt not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Welt paper
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
            {sheet.isWelt
              ? "Still for sale. Seller taped the welt note. Status stays available. Not a cobbler."
              : "Still peeling. Still a pair. Tape it when walkers still want the pair welted."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isWelt ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not welt them"
              title={WELT_NOTICE_TITLE}
              body={`${WELT_STILL_LINE} avail=open still lists this pair.`}
            />
          ) : (
            <ListingWeltEmpty listingId={sheet.listingId} />
          )}

          <WeltForm listingId={sheet.listingId} isWelt={sheet.isWelt} />

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
