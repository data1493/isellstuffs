import Link from "next/link";

import { ListingBakeEmpty } from "@/components/listing-bake-empty";
import { SyncBake } from "@/components/listing-bake-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  BAKE_HISS_LINE,
  BAKE_MIRROR_SCRIPT,
  BAKE_NOTICE_TITLE,
  BAKE_REFUSE_COPY,
  BAKE_REWIND_LINE,
  BAKE_RIP_LINE,
  BAKE_SONGS_LINE,
  BAKE_STAYS_LINE,
  BAKE_STILL_LINE,
  BAKE_TABLE_LINE,
  BAKE_TOTE_LINE,
  BAKE_WALK_LINE,
} from "@/lib/listing-bake";
import { listingBakeWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type BakeViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type BakeViewSheet = {
  kind: BakeViewKind;
  listingId: string;
  isBake: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function BakeMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={BAKE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function BakeRefused({ sheet }: { sheet: BakeViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-bake-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={BAKE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A bake refusal is for a cassette on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {BAKE_TABLE_LINE} {BAKE_REWIND_LINE} {BAKE_HISS_LINE}{" "}
              {BAKE_STILL_LINE}
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

function BakeForm({
  listingId,
  isBake,
}: {
  listingId: string;
  isBake: boolean;
}) {
  return (
    <form
      method="post"
      action={listingBakeWritePath()}
      className="space-y-3"
      data-bake-form={isBake ? "open" : "bake"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isBake ? "open" : "bake"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/bake`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isBake ? "Leave the tape" : "I will not bake"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isBake
          ? "Clear the bake paper. Status and the tote stay put."
          : `${BAKE_NOTICE_TITLE} ${BAKE_STAYS_LINE} ${BAKE_STILL_LINE} ${BAKE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingBakeView({
  sheet,
  bakeIds,
}: {
  sheet: BakeViewSheet;
  bakeIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <BakeMissing />;
  }

  if (sheet.kind !== "physical") {
    return <BakeRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-bake-sheet="physical"
      data-bake-state={sheet.isBake ? "bake" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: BAKE_MIRROR_SCRIPT }} />
      <SyncBake listingIds={bakeIds} />

      <MallHero>
        <MallCrumb label="I will not bake">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Bake</span>
        </MallCrumb>

        <MallEyebrow>I will not bake</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isBake ? BAKE_NOTICE_TITLE : BAKE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {BAKE_TABLE_LINE} {BAKE_REWIND_LINE} {BAKE_HISS_LINE} {BAKE_RIP_LINE}{" "}
            {BAKE_SONGS_LINE} {BAKE_WALK_LINE} {BAKE_STAYS_LINE} {BAKE_STILL_LINE}{" "}
            {BAKE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-bake-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isBake ? (
              <Badge variant="outline">I will not bake</Badge>
            ) : (
              <Badge variant="ghost">Bake not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Bake paper
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
            {sheet.isBake
              ? "Still for sale. Seller will not bake the cassette. Status stays available. Not a bake shop."
              : "Hiss is the hiss. Rip is no WAV. Songs is no titles. Tape it when walkers want the sticky-shed baked."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isBake ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not bake"
              title={BAKE_NOTICE_TITLE}
              body={`${BAKE_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingBakeEmpty listingId={sheet.listingId} />
          )}

          <BakeForm listingId={sheet.listingId} isBake={sheet.isBake} />

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
