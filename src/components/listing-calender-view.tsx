import Link from "next/link";

import { ListingCalenderEmpty } from "@/components/listing-calender-empty";
import { SyncCalender } from "@/components/listing-calender-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  CALENDER_CAR_LINE,
  CALENDER_LEAVE_LINE,
  CALENDER_MINT_LINE,
  CALENDER_MIRROR_SCRIPT,
  CALENDER_NOTICE_TITLE,
  CALENDER_REFUSE_COPY,
  CALENDER_STAYS_LINE,
  CALENDER_STILL_LINE,
  CALENDER_TABLE_LINE,
  CALENDER_TOTE_LINE,
  CALENDER_WALK_LINE,
} from "@/lib/listing-calender";
import { listingCalenderWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type CalenderViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "sneakers"
  | "chair"
  | "owned";

export type CalenderViewSheet = {
  kind: CalenderViewKind;
  listingId: string;
  isCalender: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function CalenderMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={CALENDER_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function CalenderRefused({ sheet }: { sheet: CalenderViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const sneakers = sheet.kind === "sneakers";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-calender-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : sneakers
                ? "Split soles stay split"
                : chair
                  ? "A chair is not a jacket"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={CALENDER_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A calender note is for the windbreaker on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {CALENDER_TABLE_LINE} {CALENDER_MINT_LINE} {CALENDER_CAR_LINE}{" "}
              {CALENDER_STILL_LINE}
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

function CalenderForm({
  listingId,
  isCalender,
}: {
  listingId: string;
  isCalender: boolean;
}) {
  return (
    <form
      method="post"
      action={listingCalenderWritePath()}
      className="space-y-3"
      data-calender-form={isCalender ? "open" : "calender"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isCalender ? "open" : "calender"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/calender`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isCalender ? CALENDER_LEAVE_LINE : CALENDER_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isCalender
          ? "Clear the tape. Status and the tote stay put."
          : `${CALENDER_STAYS_LINE} ${CALENDER_MINT_LINE} ${CALENDER_CAR_LINE} ${CALENDER_STILL_LINE} ${CALENDER_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingCalenderView({
  sheet,
  calenderIds,
}: {
  sheet: CalenderViewSheet;
  calenderIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <CalenderMissing />;
  }

  if (sheet.kind !== "physical") {
    return <CalenderRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-calender-sheet="physical"
      data-calender-state={sheet.isCalender ? "calender" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: CALENDER_MIRROR_SCRIPT }} />
      <SyncCalender listingIds={calenderIds} />

      <MallHero>
        <MallCrumb label="I will not calender it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Calender</span>
        </MallCrumb>

        <MallEyebrow>I will not calender it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isCalender ? CALENDER_NOTICE_TITLE : CALENDER_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {CALENDER_TABLE_LINE} {CALENDER_MINT_LINE} {CALENDER_CAR_LINE}{" "}
            {CALENDER_WALK_LINE} {CALENDER_STAYS_LINE} {CALENDER_STILL_LINE}{" "}
            {CALENDER_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-calender-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isCalender ? (
              <Badge variant="outline">I will not calender it</Badge>
            ) : (
              <Badge variant="ghost">Calender not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Calender paper
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
            {sheet.isCalender
              ? "Still for sale. Seller taped the calender note. Status stays available. Not a shop."
              : "Still mint-green. Still smells like a car. Tape it when walkers still want a shop hot-roll."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isCalender ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not calender it"
              title={CALENDER_NOTICE_TITLE}
              body={`${CALENDER_STILL_LINE} avail=open still lists this jacket.`}
            />
          ) : (
            <ListingCalenderEmpty listingId={sheet.listingId} />
          )}

          <CalenderForm listingId={sheet.listingId} isCalender={sheet.isCalender} />

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
