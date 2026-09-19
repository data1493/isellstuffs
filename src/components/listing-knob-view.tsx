import Link from "next/link";

import { ListingKnobEmpty } from "@/components/listing-knob-empty";
import { SyncKnob } from "@/components/listing-knob-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  KNOB_FITS_LINE,
  KNOB_LID_LINE,
  KNOB_MIRROR_SCRIPT,
  KNOB_REFUSE_COPY,
  KNOB_STILL_LINE,
  KNOB_TABLE_LINE,
  KNOB_TIGHTEN_LINE,
  KNOB_TOTE_LINE,
} from "@/lib/listing-knob";
import { listingKnobWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type KnobViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type KnobViewSheet = {
  kind: KnobViewKind;
  listingId: string;
  isKnob: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function KnobMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={KNOB_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function KnobRefused({ sheet }: { sheet: KnobViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-knob-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={KNOB_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Knob honesty is for a pot lid on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {KNOB_TABLE_LINE} {KNOB_TIGHTEN_LINE} {KNOB_STILL_LINE}
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

function KnobForm({
  listingId,
  isKnob,
}: {
  listingId: string;
  isKnob: boolean;
}) {
  return (
    <form
      method="post"
      action={listingKnobWritePath()}
      className="space-y-3"
      data-knob-form={isKnob ? "open" : "knob"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isKnob ? "open" : "knob"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/knob`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isKnob ? "Screw holds" : "The knob stays loose"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isKnob
          ? "Clear the tape. Status and the tote stay put."
          : `${KNOB_TIGHTEN_LINE} ${KNOB_STILL_LINE} ${KNOB_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingKnobView({
  sheet,
  knobIds,
}: {
  sheet: KnobViewSheet;
  knobIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <KnobMissing />;
  }

  if (sheet.kind !== "physical") {
    return <KnobRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-knob-sheet="physical"
      data-knob-state={sheet.isKnob ? "knob" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: KNOB_MIRROR_SCRIPT }} />
      <SyncKnob listingIds={knobIds} />

      <MallHero>
        <MallCrumb label="The knob stays loose">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Knob</span>
        </MallCrumb>

        <MallEyebrow>Knob honesty</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isKnob ? KNOB_TABLE_LINE : "The knob stays loose."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {KNOB_TABLE_LINE} {KNOB_TIGHTEN_LINE} {KNOB_STILL_LINE} {KNOB_TOTE_LINE}{" "}
            {KNOB_FITS_LINE} {KNOB_LID_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-knob-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isKnob ? (
              <Badge variant="outline">The knob stays loose</Badge>
            ) : (
              <Badge variant="ghost">Screw holds</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Knob tag
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
            {sheet.isKnob
              ? "Still for sale. Seller taped the loose knob. Status stays available. Not a fourth status."
              : "Fits is the 3-quart. Tape the knob when the pot-lid screw already wiggles."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isKnob ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="The knob stays loose"
              title={KNOB_TABLE_LINE}
              body={`${KNOB_TIGHTEN_LINE} ${KNOB_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingKnobEmpty listingId={sheet.listingId} />
          )}

          <KnobForm listingId={sheet.listingId} isKnob={sheet.isKnob} />

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
