import Link from "next/link";

import { ListingVentEmpty } from "@/components/listing-vent-empty";
import { SyncVent } from "@/components/listing-vent-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  VENT_LID_LINE,
  VENT_MIRROR_SCRIPT,
  VENT_NOTICE_TITLE,
  VENT_REFUSE_COPY,
  VENT_STAYS_LINE,
  VENT_STILL_LINE,
  VENT_TABLE_LINE,
  VENT_TOTE_LINE,
  VENT_WALK_LINE,
} from "@/lib/listing-vent";
import { listingPath, listingVentWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type VentViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type VentViewSheet = {
  kind: VentViewKind;
  listingId: string;
  isVent: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function VentMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={VENT_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function VentRefused({ sheet }: { sheet: VentViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-vent-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={VENT_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A vent note is for a lid on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {VENT_TABLE_LINE} {VENT_LID_LINE} {VENT_STILL_LINE}
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

function VentForm({
  listingId,
  isVent,
}: {
  listingId: string;
  isVent: boolean;
}) {
  return (
    <form
      method="post"
      action={listingVentWritePath()}
      className="space-y-3"
      data-vent-form={isVent ? "open" : "vent"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isVent ? "open" : "vent"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/vent`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isVent ? "Leave the lid solid" : "I will not vent"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isVent
          ? "Clear the tape. Status and the tote stay put."
          : `${VENT_STAYS_LINE} ${VENT_LID_LINE} ${VENT_STILL_LINE} ${VENT_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingVentView({
  sheet,
  ventIds,
}: {
  sheet: VentViewSheet;
  ventIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <VentMissing />;
  }

  if (sheet.kind !== "physical") {
    return <VentRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-vent-sheet="physical"
      data-vent-state={sheet.isVent ? "vent" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: VENT_MIRROR_SCRIPT }} />
      <SyncVent listingIds={ventIds} />

      <MallHero>
        <MallCrumb label="I will not vent">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Vent</span>
        </MallCrumb>

        <MallEyebrow>I will not vent</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isVent ? VENT_NOTICE_TITLE : VENT_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {VENT_TABLE_LINE} {VENT_LID_LINE} {VENT_WALK_LINE}{" "}
            {VENT_STAYS_LINE} {VENT_STILL_LINE} {VENT_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-vent-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isVent ? (
              <Badge variant="outline">I will not vent</Badge>
            ) : (
              <Badge variant="ghost">Vent not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Vent paper
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
            {sheet.isVent
              ? "Still for sale. Seller taped the vent note. Status stays available. Still a lid."
              : "Solid glass. Still a lid. Tape it when walkers still want a steam hole."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isVent ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not vent"
              title={VENT_NOTICE_TITLE}
              body={`${VENT_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingVentEmpty listingId={sheet.listingId} />
          )}

          <VentForm listingId={sheet.listingId} isVent={sheet.isVent} />

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
