import Link from "next/link";

import { ListingDongleEmpty } from "@/components/listing-dongle-empty";
import { SyncDongle } from "@/components/listing-dongle-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  DONGLE_MIRROR_SCRIPT,
  DONGLE_NOTICE_TITLE,
  DONGLE_REFUSE_COPY,
  DONGLE_SOLD_LINE,
  DONGLE_STAYS_LINE,
  DONGLE_STILL_LINE,
  DONGLE_TABLE_LINE,
  DONGLE_TOTE_LINE,
  DONGLE_WALK_LINE,
} from "@/lib/listing-dongle";
import { listingDongleWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type DongleViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type DongleViewSheet = {
  kind: DongleViewKind;
  listingId: string;
  isDongle: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function DongleMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={DONGLE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function DongleRefused({ sheet }: { sheet: DongleViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-dongle-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={DONGLE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A dongle note is for a drawer on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {DONGLE_TABLE_LINE} {DONGLE_SOLD_LINE} {DONGLE_STILL_LINE}
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

function DongleForm({
  listingId,
  isDongle,
}: {
  listingId: string;
  isDongle: boolean;
}) {
  return (
    <form
      method="post"
      action={listingDongleWritePath()}
      className="space-y-3"
      data-dongle-form={isDongle ? "open" : "dongle"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isDongle ? "open" : "dongle"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/dongle`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isDongle ? "Leave the pile" : "I don't have a dongle"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isDongle
          ? "Clear the tape. Status and the tote stay put."
          : `${DONGLE_STAYS_LINE} ${DONGLE_STILL_LINE} ${DONGLE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingDongleView({
  sheet,
  dongleIds,
}: {
  sheet: DongleViewSheet;
  dongleIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <DongleMissing />;
  }

  if (sheet.kind !== "physical") {
    return <DongleRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-dongle-sheet="physical"
      data-dongle-state={sheet.isDongle ? "dongle" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: DONGLE_MIRROR_SCRIPT }} />
      <SyncDongle listingIds={dongleIds} />

      <MallHero>
        <MallCrumb label="I don't have a dongle">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Dongle</span>
        </MallCrumb>

        <MallEyebrow>I don't have a dongle</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isDongle ? DONGLE_NOTICE_TITLE : DONGLE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {DONGLE_TABLE_LINE} {DONGLE_SOLD_LINE} {DONGLE_WALK_LINE}{" "}
            {DONGLE_STAYS_LINE} {DONGLE_STILL_LINE} {DONGLE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-dongle-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isDongle ? (
              <Badge variant="outline">I don't have a dongle</Badge>
            ) : (
              <Badge variant="ghost">Dongle not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Dongle paper
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
            {sheet.isDongle
              ? "Still for sale. Seller taped the dongle note. Status stays available. Not a cable counter."
              : "Sold as a pile. Tape it when walkers still want a dongle in the drawer."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isDongle ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a dongle"
              title={DONGLE_NOTICE_TITLE}
              body={`${DONGLE_STILL_LINE} avail=open still lists this drawer.`}
            />
          ) : (
            <ListingDongleEmpty listingId={sheet.listingId} />
          )}

          <DongleForm listingId={sheet.listingId} isDongle={sheet.isDongle} />

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
