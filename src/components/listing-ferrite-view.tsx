import Link from "next/link";

import { ListingFerriteEmpty } from "@/components/listing-ferrite-empty";
import { SyncFerrite } from "@/components/listing-ferrite-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  FERRITE_LEAVE_LINE,
  FERRITE_MIRROR_SCRIPT,
  FERRITE_NOTICE_TITLE,
  FERRITE_PILE_LINE,
  FERRITE_REFUSE_COPY,
  FERRITE_STAYS_LINE,
  FERRITE_STILL_LINE,
  FERRITE_TABLE_LINE,
  FERRITE_TOTE_LINE,
  FERRITE_UNTESTED_LINE,
  FERRITE_WALK_LINE,
} from "@/lib/listing-ferrite";
import { listingFerriteWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type FerriteViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type FerriteViewSheet = {
  kind: FerriteViewKind;
  listingId: string;
  isFerrite: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function FerriteMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={FERRITE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function FerriteRefused({ sheet }: { sheet: FerriteViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-ferrite-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={FERRITE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A ferrite note is for a pile on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {FERRITE_TABLE_LINE} {FERRITE_PILE_LINE} {FERRITE_UNTESTED_LINE}{" "}
              {FERRITE_STILL_LINE}
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

function FerriteForm({
  listingId,
  isFerrite,
}: {
  listingId: string;
  isFerrite: boolean;
}) {
  return (
    <form
      method="post"
      action={listingFerriteWritePath()}
      className="space-y-3"
      data-ferrite-form={isFerrite ? "open" : "ferrite"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isFerrite ? "open" : "ferrite"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/ferrite`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isFerrite ? FERRITE_LEAVE_LINE : FERRITE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isFerrite
          ? "Clear the tape. Status and the tote stay put."
          : `${FERRITE_STAYS_LINE} ${FERRITE_PILE_LINE} ${FERRITE_UNTESTED_LINE} ${FERRITE_STILL_LINE} ${FERRITE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingFerriteView({
  sheet,
  ferriteIds,
}: {
  sheet: FerriteViewSheet;
  ferriteIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <FerriteMissing />;
  }

  if (sheet.kind !== "physical") {
    return <FerriteRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-ferrite-sheet="physical"
      data-ferrite-state={sheet.isFerrite ? "ferrite" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: FERRITE_MIRROR_SCRIPT }} />
      <SyncFerrite listingIds={ferriteIds} />

      <MallHero>
        <MallCrumb label="I will not ferrite them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Ferrite</span>
        </MallCrumb>

        <MallEyebrow>I will not ferrite them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isFerrite ? FERRITE_NOTICE_TITLE : FERRITE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {FERRITE_TABLE_LINE} {FERRITE_PILE_LINE} {FERRITE_UNTESTED_LINE}{" "}
            {FERRITE_WALK_LINE} {FERRITE_STAYS_LINE} {FERRITE_STILL_LINE}{" "}
            {FERRITE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-ferrite-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isFerrite ? (
              <Badge variant="outline">I will not ferrite them</Badge>
            ) : (
              <Badge variant="ghost">Ferrite not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Ferrite paper
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
            {sheet.isFerrite
              ? "Still for sale. Seller taped the ferrite note. Status stays available. Not a shop."
              : "Still a pile. Still untested. Tape it when walkers still want the drawer ferrited."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isFerrite ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not ferrite them"
              title={FERRITE_NOTICE_TITLE}
              body={`${FERRITE_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingFerriteEmpty listingId={sheet.listingId} />
          )}

          <FerriteForm listingId={sheet.listingId} isFerrite={sheet.isFerrite} />

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
