import Link from "next/link";

import { ListingNabsEmpty } from "@/components/listing-nabs-empty";
import { SyncNabs } from "@/components/listing-nabs-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  NABS_HISS_LINE,
  NABS_LEAVE_LINE,
  NABS_MIRROR_SCRIPT,
  NABS_NOTICE_TITLE,
  NABS_RADIO_LINE,
  NABS_REFUSE_COPY,
  NABS_STAYS_LINE,
  NABS_STILL_LINE,
  NABS_TABLE_LINE,
  NABS_TOTE_LINE,
  NABS_WALK_LINE,
} from "@/lib/listing-nabs";
import { listingNabsWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type NabsViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "lp"
  | "jewels"
  | "chair"
  | "owned";

export type NabsViewSheet = {
  kind: NabsViewKind;
  listingId: string;
  isNabs: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function NabsMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={NABS_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function NabsRefused({ sheet }: { sheet: NabsViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const lp = sheet.kind === "lp";
  const jewels = sheet.kind === "jewels";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-nabs-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : lp
                ? "A record is not a cassette"
                : jewels
                  ? "Jewel cases do not nabs"
                  : chair
                    ? "A chair is not a cassette"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={NABS_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A nabs note is for SUMMER 93 on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {NABS_TABLE_LINE} {NABS_HISS_LINE} {NABS_RADIO_LINE}{" "}
              {NABS_STILL_LINE}
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

function NabsForm({
  listingId,
  isNabs,
}: {
  listingId: string;
  isNabs: boolean;
}) {
  return (
    <form
      method="post"
      action={listingNabsWritePath()}
      className="space-y-3"
      data-nabs-form={isNabs ? "open" : "nabs"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isNabs ? "open" : "nabs"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/nabs`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isNabs ? NABS_LEAVE_LINE : NABS_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isNabs
          ? "Clear the tape. Status and the tote stay put."
          : `${NABS_STAYS_LINE} ${NABS_HISS_LINE} ${NABS_RADIO_LINE} ${NABS_STILL_LINE} ${NABS_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingNabsView({
  sheet,
  nabsIds,
}: {
  sheet: NabsViewSheet;
  nabsIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <NabsMissing />;
  }

  if (sheet.kind !== "physical") {
    return <NabsRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-nabs-sheet="physical"
      data-nabs-state={sheet.isNabs ? "nabs" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: NABS_MIRROR_SCRIPT }} />
      <SyncNabs listingIds={nabsIds} />

      <MallHero>
        <MallCrumb label="I will not nabs it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Nabs</span>
        </MallCrumb>

        <MallEyebrow>I will not nabs it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isNabs ? NABS_NOTICE_TITLE : NABS_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {NABS_TABLE_LINE} {NABS_HISS_LINE} {NABS_RADIO_LINE}{" "}
            {NABS_WALK_LINE} {NABS_STAYS_LINE} {NABS_STILL_LINE}{" "}
            {NABS_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-nabs-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isNabs ? (
              <Badge variant="outline">I will not nabs it</Badge>
            ) : (
              <Badge variant="ghost">Nabs not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Nabs paper
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
            {sheet.isNabs
              ? "Still for sale. Seller taped the nabs note. Status stays available. Not a shop."
              : "Still hiss. Still a radio edit. Tape it when walkers still want shop NAB."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isNabs ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not nabs it"
              title={NABS_NOTICE_TITLE}
              body={`${NABS_STILL_LINE} avail=open still lists this tape.`}
            />
          ) : (
            <ListingNabsEmpty listingId={sheet.listingId} />
          )}

          <NabsForm listingId={sheet.listingId} isNabs={sheet.isNabs} />

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
