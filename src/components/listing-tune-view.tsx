import Link from "next/link";

import { ListingTuneEmpty } from "@/components/listing-tune-empty";
import { SyncTune } from "@/components/listing-tune-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  TUNE_MIRROR_SCRIPT,
  TUNE_NOTICE_TITLE,
  TUNE_REFUSE_COPY,
  TUNE_STAYS_LINE,
  TUNE_STILL_LINE,
  TUNE_TABLE_LINE,
  TUNE_TOTE_LINE,
  TUNE_WALK_LINE,
} from "@/lib/listing-tune";
import { listingPath, listingTuneWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type TuneViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type TuneViewSheet = {
  kind: TuneViewKind;
  listingId: string;
  isTune: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function TuneMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={TUNE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function TuneRefused({ sheet }: { sheet: TuneViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-tune-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={TUNE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "I will not tune it is for a file on the digital lot, not a CD-R and not a gift code."
              )}
            </p>
            <p>
              {TUNE_NOTICE_TITLE} {TUNE_WALK_LINE} {TUNE_STILL_LINE}
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

function TuneForm({
  listingId,
  isTune,
}: {
  listingId: string;
  isTune: boolean;
}) {
  return (
    <form
      method="post"
      action={listingTuneWritePath()}
      className="space-y-3"
      data-tune-form={isTune ? "open" : "tune"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isTune ? "open" : "tune"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/tune`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isTune ? "Leave the one-shots" : "I will not tune it"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isTune
          ? "Clear the tune paper. Status and the tote stay put."
          : `${TUNE_STAYS_LINE} ${TUNE_WALK_LINE} ${TUNE_STILL_LINE} ${TUNE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingTuneView({
  sheet,
  tuneIds,
}: {
  sheet: TuneViewSheet;
  tuneIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <TuneMissing />;
  }

  if (sheet.kind !== "digital") {
    return <TuneRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-tune-sheet="digital"
      data-tune-state={sheet.isTune ? "tune" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: TUNE_MIRROR_SCRIPT }} />
      <SyncTune listingIds={tuneIds} />

      <MallHero>
        <MallCrumb label="I will not tune it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Tune</span>
        </MallCrumb>

        <MallEyebrow>I will not tune it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isTune ? TUNE_NOTICE_TITLE : TUNE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {TUNE_NOTICE_TITLE} {TUNE_WALK_LINE} {TUNE_STILL_LINE} {TUNE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-tune-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isTune ? (
              <Badge variant="outline">I will not tune it</Badge>
            ) : (
              <Badge variant="ghost">Still as recorded</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Tune paper
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
            {sheet.isTune
              ? "Still for sale. Seller taped that the one-shots stay as recorded. Walkers still ask Beats to put them in C. Status stays available."
              : "One-shots as recorded. Tape it when walkers still want the kicks in C."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isTune ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not tune it"
              title={TUNE_NOTICE_TITLE}
              body={`${TUNE_STILL_LINE} avail=open still lists this file. ${TUNE_STAYS_LINE}`}
            />
          ) : (
            <ListingTuneEmpty listingId={sheet.listingId} />
          )}

          <TuneForm listingId={sheet.listingId} isTune={sheet.isTune} />

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
