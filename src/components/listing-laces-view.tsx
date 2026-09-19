import Link from "next/link";

import { SyncLaces } from "@/components/listing-laces-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  LACES_EMPTY_LINE,
  LACES_EMPTY_TAPE,
  LACES_HOME_LINE,
  LACES_MIRROR_SCRIPT,
  LACES_NOTE_MAX,
  LACES_PAPER_LINE,
  LACES_REFUSE_COPY,
  LACES_SIZE_LINE,
  LACES_STILL_LINE,
  LACES_TABLE_LINE,
  LACES_TOTE_LINE,
  LACES_VAN_LINE,
  type ListingLacesMap,
  type ListingLacesNote,
} from "@/lib/listing-laces";
import {
  listingLacesPath,
  listingLacesWritePath,
  listingPath,
  stallPath,
} from "@/lib/paths";
import { cn } from "@/lib/utils";

export type LacesViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type LacesViewSheet = {
  kind: LacesViewKind;
  listingId: string;
  current?: ListingLacesNote;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function LacesMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={LACES_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function LacesRefused({ sheet }: { sheet: LacesViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <MallNotice
      tone="empty"
      eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
      title={LACES_REFUSE_COPY}
      body={
        <div className="space-y-2" data-laces-sheet={sheet.kind}>
          <p>
            {sheet.fact ? (
              <>
                <span className="font-medium text-foreground">{sheet.fact}</span>
                {sheet.stallName ? <> · {sheet.stallName}</> : null}
              </>
            ) : (
              "Laces paper is for a pair on the table, not a PDF and not a gift code."
            )}
          </p>
          <p>
            {LACES_TABLE_LINE} {LACES_STILL_LINE} {LACES_VAN_LINE}
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

function LacesForm({
  listingId,
  current,
}: {
  listingId: string;
  current?: ListingLacesNote;
}) {
  const lacesPath = listingLacesPath(listingId);

  return (
    <div className="space-y-4">
      <form
        method="post"
        action={listingLacesWritePath()}
        className="space-y-3"
        data-laces-form="tape"
      >
        <input type="hidden" name="listingId" value={listingId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={lacesPath} />
        <div className="space-y-1.5">
          <Label htmlFor="listing-laces-note">Which laces stayed home?</Label>
          <input
            id="listing-laces-note"
            name="note"
            type="text"
            maxLength={LACES_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="These are the beat originals."
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
          Tape the good laces
        </button>
        <p className="text-sm leading-6 text-muted-foreground">
          {LACES_HOME_LINE} {LACES_STILL_LINE} {LACES_TOTE_LINE} {LACES_VAN_LINE}
        </p>
      </form>

      {current ? (
        <form
          method="post"
          action={listingLacesWritePath()}
          data-laces-form="clear"
        >
          <input type="hidden" name="listingId" value={listingId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={lacesPath} />
          <button
            type="submit"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 w-full rounded-full sm:w-auto",
            )}
          >
            Leave the pair
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function ListingLacesView({
  sheet,
  map,
  emptyTape,
}: {
  sheet: LacesViewSheet;
  map: ListingLacesMap;
  emptyTape?: boolean;
}) {
  if (sheet.kind === "missing") {
    return <LacesMissing />;
  }

  if (sheet.kind !== "physical") {
    return <LacesRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;
  const taped = Boolean(sheet.current);

  return (
    <div
      data-laces-sheet="physical"
      data-laces-state={taped ? "taped" : "empty"}
    >
      <script dangerouslySetInnerHTML={{ __html: LACES_MIRROR_SCRIPT }} />
      <SyncLaces map={map} />

      <MallHero>
        <MallCrumb label="I kept the good laces">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Laces</span>
        </MallCrumb>

        <MallEyebrow>Pair paper</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {taped ? sheet.current!.note : LACES_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {LACES_PAPER_LINE} {LACES_HOME_LINE} {LACES_STILL_LINE}{" "}
            {LACES_TOTE_LINE} {LACES_VAN_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-laces-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {taped ? (
              <Badge variant="outline">Beat originals</Badge>
            ) : (
              <Badge variant="ghost">Laces unknown</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Pair tag
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
              ? "Still for sale. The nice laces stayed home. Status stays available."
              : "The sneakers are on the table. Tape that the fat pair stayed in the van. Van restock stays the extra pile."}
          </p>
        </article>

        <div className="space-y-4">
          {emptyTape ? (
            <MallNotice
              tone="error"
              padded={false}
              titleAs="h2"
              eyebrow="Blank tape"
              title={LACES_EMPTY_TAPE}
              body="Write what stayed home — fat laces, the beat originals, whatever walkers ask about."
            />
          ) : null}

          {taped ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow={LACES_TABLE_LINE}
              title={sheet.current!.note}
              body={`${LACES_HOME_LINE} ${LACES_STILL_LINE} ${LACES_TOTE_LINE} ${LACES_VAN_LINE} ${LACES_SIZE_LINE}`}
            />
          ) : (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Laces unknown"
              title={LACES_EMPTY_LINE}
              body="Tape that you kept the good pair when walkers ask. It does not drop the tote or restock the van."
            />
          )}

          <LacesForm listingId={sheet.listingId} current={sheet.current} />

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
