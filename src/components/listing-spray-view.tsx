import Link from "next/link";

import { ListingSprayEmpty } from "@/components/listing-spray-empty";
import { SyncSpray } from "@/components/listing-spray-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  SPRAY_JACKET_LINE,
  SPRAY_MIRROR_SCRIPT,
  SPRAY_NOTICE_TITLE,
  SPRAY_REFUSE_COPY,
  SPRAY_STAYS_LINE,
  SPRAY_STILL_LINE,
  SPRAY_TABLE_LINE,
  SPRAY_TOTE_LINE,
  SPRAY_WALK_LINE,
  SPRAY_WORN_LINE,
} from "@/lib/listing-spray";
import { listingPath, listingSprayWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type SprayViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type SprayViewSheet = {
  kind: SprayViewKind;
  listingId: string;
  isSpray: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function SprayMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={SPRAY_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function SprayRefused({ sheet }: { sheet: SprayViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-spray-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={SPRAY_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A spray note is for a windbreaker on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {SPRAY_TABLE_LINE} {SPRAY_WORN_LINE} {SPRAY_JACKET_LINE} {SPRAY_STILL_LINE}
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

function SprayForm({
  listingId,
  isSpray,
}: {
  listingId: string;
  isSpray: boolean;
}) {
  return (
    <form
      method="post"
      action={listingSprayWritePath()}
      className="space-y-3"
      data-spray-form={isSpray ? "open" : "spray"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isSpray ? "open" : "spray"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/spray`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isSpray ? "Leave the jacket" : "I will not spray it"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isSpray
          ? "Clear the tape. Status and the tote stay put."
          : `${SPRAY_STAYS_LINE} ${SPRAY_WORN_LINE} ${SPRAY_STILL_LINE} ${SPRAY_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingSprayView({
  sheet,
  sprayIds,
}: {
  sheet: SprayViewSheet;
  sprayIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <SprayMissing />;
  }

  if (sheet.kind !== "physical") {
    return <SprayRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-spray-sheet="physical"
      data-spray-state={sheet.isSpray ? "spray" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: SPRAY_MIRROR_SCRIPT }} />
      <SyncSpray listingIds={sprayIds} />

      <MallHero>
        <MallCrumb label="I will not spray it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Spray</span>
        </MallCrumb>

        <MallEyebrow>I will not spray it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isSpray ? SPRAY_NOTICE_TITLE : SPRAY_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SPRAY_TABLE_LINE} {SPRAY_WORN_LINE} {SPRAY_JACKET_LINE} {SPRAY_WALK_LINE}{" "}
            {SPRAY_STAYS_LINE} {SPRAY_STILL_LINE} {SPRAY_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-spray-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isSpray ? (
              <Badge variant="outline">I will not spray it</Badge>
            ) : (
              <Badge variant="ghost">Spray not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Spray paper
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
            {sheet.isSpray
              ? "Still for sale. Seller taped the spray note. Status stays available. Not a cleaners."
              : "Worn twice. Still a jacket. Tape it when walkers still want Scotchgard."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isSpray ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not spray it"
              title={SPRAY_NOTICE_TITLE}
              body={`${SPRAY_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingSprayEmpty listingId={sheet.listingId} />
          )}

          <SprayForm listingId={sheet.listingId} isSpray={sheet.isSpray} />

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
