import Link from "next/link";

import { ListingDumpEmpty } from "@/components/listing-dump-empty";
import { SyncDump } from "@/components/listing-dump-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  DUMP_CART_LINE,
  DUMP_CELLS_LINE,
  DUMP_MIRROR_SCRIPT,
  DUMP_NOTICE_TITLE,
  DUMP_PRESS_LINE,
  DUMP_REFUSE_COPY,
  DUMP_STILL_LINE,
  DUMP_TABLE_LINE,
  DUMP_TOTE_LINE,
} from "@/lib/listing-dump";
import { listingDumpWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type DumpViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type DumpViewSheet = {
  kind: DumpViewKind;
  listingId: string;
  isDump: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function DumpMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={DUMP_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function DumpRefused({ sheet }: { sheet: DumpViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-dump-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={DUMP_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A dump refusal is for a handheld on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {DUMP_TABLE_LINE} {DUMP_PRESS_LINE} {DUMP_STILL_LINE}
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

function DumpForm({
  listingId,
  isDump,
}: {
  listingId: string;
  isDump: boolean;
}) {
  return (
    <form
      method="post"
      action={listingDumpWritePath()}
      className="space-y-3"
      data-dump-form={isDump ? "open" : "dump"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isDump ? "open" : "dump"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/dump`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isDump ? "Leave the cart" : "I don't dump"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isDump
          ? "Clear the tape. Status and the tote stay put."
          : `${DUMP_PRESS_LINE} ${DUMP_CART_LINE} ${DUMP_STILL_LINE} ${DUMP_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingDumpView({
  sheet,
  dumpIds,
}: {
  sheet: DumpViewSheet;
  dumpIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <DumpMissing />;
  }

  if (sheet.kind !== "physical") {
    return <DumpRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-dump-sheet="physical"
      data-dump-state={sheet.isDump ? "dump" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: DUMP_MIRROR_SCRIPT }} />
      <SyncDump listingIds={dumpIds} />

      <MallHero>
        <MallCrumb label="I don't dump">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Dump</span>
        </MallCrumb>

        <MallEyebrow>Dump refusal</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isDump ? DUMP_NOTICE_TITLE : DUMP_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {DUMP_TABLE_LINE} {DUMP_PRESS_LINE} {DUMP_CELLS_LINE} {DUMP_CART_LINE}{" "}
            {DUMP_STILL_LINE} {DUMP_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-dump-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isDump ? (
              <Badge variant="outline">I don't dump</Badge>
            ) : (
              <Badge variant="ghost">Dump not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Dump tag
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
            {sheet.isDump
              ? "Still for sale. Seller taped the dump refusal. Status stays available. Not a fourth status."
              : "Cells are out. Line is the screen. Manual is no booklet. Tape the refusal when walkers still want a ROM."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isDump ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't dump"
              title={DUMP_NOTICE_TITLE}
              body={`${DUMP_PRESS_LINE} ${DUMP_CART_LINE} ${DUMP_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingDumpEmpty listingId={sheet.listingId} />
          )}

          <DumpForm listingId={sheet.listingId} isDump={sheet.isDump} />

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
