import Link from "next/link";

import { ListingFoamEmpty } from "@/components/listing-foam-empty";
import { SyncFoam } from "@/components/listing-foam-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  FOAM_EMPTY_CASES_LINE,
  FOAM_LEAVE_LINE,
  FOAM_MIRROR_SCRIPT,
  FOAM_NOTICE_TITLE,
  FOAM_PILE_LINE,
  FOAM_REFUSE_COPY,
  FOAM_STAYS_LINE,
  FOAM_STILL_LINE,
  FOAM_TABLE_LINE,
  FOAM_TOTE_LINE,
  FOAM_WALK_LINE,
} from "@/lib/listing-foam";
import { listingFoamWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type FoamViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type FoamViewSheet = {
  kind: FoamViewKind;
  listingId: string;
  isFoam: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function FoamMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={FOAM_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function FoamRefused({ sheet }: { sheet: FoamViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-foam-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={FOAM_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A foam note is for a pile of empty jewels on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {FOAM_TABLE_LINE} {FOAM_PILE_LINE} {FOAM_EMPTY_CASES_LINE} {FOAM_STILL_LINE}
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

function FoamForm({
  listingId,
  isFoam,
}: {
  listingId: string;
  isFoam: boolean;
}) {
  return (
    <form
      method="post"
      action={listingFoamWritePath()}
      className="space-y-3"
      data-foam-form={isFoam ? "open" : "foam"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isFoam ? "open" : "foam"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/foam`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isFoam ? FOAM_LEAVE_LINE : FOAM_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isFoam
          ? "Clear the tape. Status and the tote stay put."
          : `${FOAM_STAYS_LINE} ${FOAM_PILE_LINE} ${FOAM_EMPTY_CASES_LINE} ${FOAM_STILL_LINE} ${FOAM_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingFoamView({
  sheet,
  foamIds,
}: {
  sheet: FoamViewSheet;
  foamIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <FoamMissing />;
  }

  if (sheet.kind !== "physical") {
    return <FoamRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-foam-sheet="physical"
      data-foam-state={sheet.isFoam ? "foam" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: FOAM_MIRROR_SCRIPT }} />
      <SyncFoam listingIds={foamIds} />

      <MallHero>
        <MallCrumb label="I will not foam them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Foam</span>
        </MallCrumb>

        <MallEyebrow>I will not foam them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isFoam ? FOAM_NOTICE_TITLE : FOAM_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {FOAM_TABLE_LINE} {FOAM_PILE_LINE} {FOAM_EMPTY_CASES_LINE} {FOAM_WALK_LINE}{" "}
            {FOAM_STAYS_LINE} {FOAM_STILL_LINE} {FOAM_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-foam-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isFoam ? (
              <Badge variant="outline">I will not foam them</Badge>
            ) : (
              <Badge variant="ghost">Foam not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Foam paper
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
            {sheet.isFoam
              ? "Still for sale. Seller taped the foam note. Status stays available. Not a closer."
              : "Still a pile. Still empty. Tape it when walkers still want the jewels padded."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isFoam ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not foam them"
              title={FOAM_NOTICE_TITLE}
              body={`${FOAM_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingFoamEmpty listingId={sheet.listingId} />
          )}

          <FoamForm listingId={sheet.listingId} isFoam={sheet.isFoam} />

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
