import Link from "next/link";

import { SyncPress } from "@/components/listing-press-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  PRESS_EMPTY_LINE,
  PRESS_EMPTY_TAPE,
  PRESS_MIRROR_SCRIPT,
  PRESS_NOTE_MAX,
  PRESS_PAPER_LINE,
  PRESS_REFUSE_COPY,
  PRESS_SCAN_LINE,
  PRESS_STILL_LINE,
  PRESS_TABLE_LINE,
  PRESS_TOTE_LINE,
  type ListingPressMap,
  type ListingPressNote,
} from "@/lib/listing-press";
import { listingPath, listingPressPath, listingPressWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type PressViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type PressViewSheet = {
  kind: PressViewKind;
  listingId: string;
  current?: ListingPressNote;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function PressMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={PRESS_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function PressRefused({ sheet }: { sheet: PressViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <MallNotice
      tone="empty"
      eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
      title={PRESS_REFUSE_COPY}
      body={
        <div className="space-y-2" data-press-sheet={sheet.kind}>
          <p>
            {sheet.fact ? (
              <>
                <span className="font-medium text-foreground">{sheet.fact}</span>
                {sheet.stallName ? <> · {sheet.stallName}</> : null}
              </>
            ) : (
              "Press paper is for a record on the table, not a PDF and not a gift code."
            )}
          </p>
          <p>
            {PRESS_TABLE_LINE} {PRESS_STILL_LINE}
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

function PressForm({
  listingId,
  current,
}: {
  listingId: string;
  current?: ListingPressNote;
}) {
  const pressPath = listingPressPath(listingId);

  return (
    <div className="space-y-4">
      <form
        method="post"
        action={listingPressWritePath()}
        className="space-y-3"
        data-press-form="tape"
      >
        <input type="hidden" name="listingId" value={listingId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={pressPath} />
        <div className="space-y-1.5">
          <Label htmlFor="listing-press-note">Which press?</Label>
          <input
            id="listing-press-note"
            name="note"
            type="text"
            maxLength={PRESS_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="2010s reissue"
            className="h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <button
          type="submit"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 w-full rounded-full sm:w-auto",
          )}
        >
          Tape which press
        </button>
        <p className="text-sm leading-6 text-muted-foreground">
          {PRESS_STILL_LINE} {PRESS_TOTE_LINE} {PRESS_SCAN_LINE}
        </p>
      </form>

      {current ? (
        <form method="post" action={listingPressWritePath()} data-press-form="clear">
          <input type="hidden" name="listingId" value={listingId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={pressPath} />
          <button
            type="submit"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 w-full rounded-full sm:w-auto",
            )}
          >
            First press unknown
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function ListingPressView({
  sheet,
  map,
  emptyTape,
}: {
  sheet: PressViewSheet;
  map: ListingPressMap;
  emptyTape?: boolean;
}) {
  if (sheet.kind === "missing") {
    return <PressMissing />;
  }

  if (sheet.kind !== "physical") {
    return <PressRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;
  const taped = Boolean(sheet.current);

  return (
    <div
      data-press-sheet="physical"
      data-press-state={taped ? "taped" : "empty"}
    >
      <script dangerouslySetInnerHTML={{ __html: PRESS_MIRROR_SCRIPT }} />
      <SyncPress map={map} />

      <MallHero>
        <MallCrumb label="Which press">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Press</span>
        </MallCrumb>

        <MallEyebrow>Sleeve paper</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {taped ? sheet.current!.note : PRESS_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {PRESS_PAPER_LINE} {PRESS_STILL_LINE} {PRESS_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-press-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {taped ? (
              <Badge variant="outline">Not a first press</Badge>
            ) : (
              <Badge variant="ghost">Press unknown</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Sleeve tag
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
            {taped
              ? "Still for sale. The sleeve is honest about the pressing. Status stays available."
              : "The $9 LP is not a first press. Tape which one it is. Scan stays the liner PDF."}
          </p>
        </article>

        <div className="space-y-4">
          {emptyTape ? (
            <MallNotice
              tone="error"
              padded={false}
              titleAs="h2"
              eyebrow="Blank tape"
              title={PRESS_EMPTY_TAPE}
              body="Write the pressing — 2010s reissue, club edition, whatever is on the sleeve."
            />
          ) : null}

          {taped ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow={PRESS_TABLE_LINE}
              title={sheet.current!.note}
              body={`${PRESS_STILL_LINE} ${PRESS_TOTE_LINE} ${PRESS_SCAN_LINE}`}
            />
          ) : (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Press unknown"
              title={PRESS_EMPTY_LINE}
              body="Tape which press when the sleeve is not original. It does not drop the tote or pair a file."
            />
          )}

          <PressForm listingId={sheet.listingId} current={sheet.current} />

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
