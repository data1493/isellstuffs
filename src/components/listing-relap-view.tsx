import Link from "next/link";

import { ListingRelapEmpty } from "@/components/listing-relap-empty";
import { SyncRelap } from "@/components/listing-relap-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  RELAP_HISS_LINE,
  RELAP_LEAVE_LINE,
  RELAP_MIRROR_SCRIPT,
  RELAP_NOTICE_TITLE,
  RELAP_RADIO_LINE,
  RELAP_REFUSE_COPY,
  RELAP_STAYS_LINE,
  RELAP_STILL_LINE,
  RELAP_TABLE_LINE,
  RELAP_TOTE_LINE,
  RELAP_WALK_LINE,
} from "@/lib/listing-relap";
import { listingPath, listingRelapWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type RelapViewKind =
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

export type RelapViewSheet = {
  kind: RelapViewKind;
  listingId: string;
  isRelap: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function RelapMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={RELAP_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function RelapRefused({ sheet }: { sheet: RelapViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const lp = sheet.kind === "lp";
  const jewels = sheet.kind === "jewels";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-relap-sheet={sheet.kind}>
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
                  ? "Jewel cases do not relap"
                  : chair
                    ? "A chair is not a cassette"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={RELAP_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A relap note is for SUMMER 93 on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {RELAP_TABLE_LINE} {RELAP_HISS_LINE} {RELAP_RADIO_LINE}{" "}
              {RELAP_STILL_LINE}
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

function RelapForm({
  listingId,
  isRelap,
}: {
  listingId: string;
  isRelap: boolean;
}) {
  return (
    <form
      method="post"
      action={listingRelapWritePath()}
      className="space-y-3"
      data-relap-form={isRelap ? "open" : "relap"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isRelap ? "open" : "relap"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/relap`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isRelap ? RELAP_LEAVE_LINE : RELAP_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isRelap
          ? "Clear the tape. Status and the tote stay put."
          : `${RELAP_STAYS_LINE} ${RELAP_HISS_LINE} ${RELAP_RADIO_LINE} ${RELAP_STILL_LINE} ${RELAP_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingRelapView({
  sheet,
  relapIds,
}: {
  sheet: RelapViewSheet;
  relapIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <RelapMissing />;
  }

  if (sheet.kind !== "physical") {
    return <RelapRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-relap-sheet="physical"
      data-relap-state={sheet.isRelap ? "relap" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: RELAP_MIRROR_SCRIPT }} />
      <SyncRelap listingIds={relapIds} />

      <MallHero>
        <MallCrumb label="I will not relap it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Relap</span>
        </MallCrumb>

        <MallEyebrow>I will not relap it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isRelap ? RELAP_NOTICE_TITLE : RELAP_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {RELAP_TABLE_LINE} {RELAP_HISS_LINE} {RELAP_RADIO_LINE}{" "}
            {RELAP_WALK_LINE} {RELAP_STAYS_LINE} {RELAP_STILL_LINE}{" "}
            {RELAP_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-relap-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isRelap ? (
              <Badge variant="outline">I will not relap it</Badge>
            ) : (
              <Badge variant="ghost">Relap not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Relap paper
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
            {sheet.isRelap
              ? "Still for sale. Seller taped the relap note. Status stays available. Not a shop."
              : "Still hiss. Still a radio edit. Tape it when walkers still want shop head stones."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isRelap ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not relap it"
              title={RELAP_NOTICE_TITLE}
              body={`${RELAP_STILL_LINE} avail=open still lists this tape.`}
            />
          ) : (
            <ListingRelapEmpty listingId={sheet.listingId} />
          )}

          <RelapForm listingId={sheet.listingId} isRelap={sheet.isRelap} />

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
