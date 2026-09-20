import Link from "next/link";

import { ListingPinchEmpty } from "@/components/listing-pinch-empty";
import { SyncPinch } from "@/components/listing-pinch-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  PINCH_HISS_LINE,
  PINCH_LEAVE_LINE,
  PINCH_MIRROR_SCRIPT,
  PINCH_NOTICE_TITLE,
  PINCH_RADIO_LINE,
  PINCH_REFUSE_COPY,
  PINCH_STAYS_LINE,
  PINCH_STILL_LINE,
  PINCH_TABLE_LINE,
  PINCH_TOTE_LINE,
  PINCH_WALK_LINE,
} from "@/lib/listing-pinch";
import { listingPath, listingPinchWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type PinchViewKind =
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

export type PinchViewSheet = {
  kind: PinchViewKind;
  listingId: string;
  isPinch: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function PinchMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={PINCH_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function PinchRefused({ sheet }: { sheet: PinchViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const lp = sheet.kind === "lp";
  const jewels = sheet.kind === "jewels";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-pinch-sheet={sheet.kind}>
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
                  ? "Jewel cases do not pinch"
                  : chair
                    ? "A chair is not a cassette"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={PINCH_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A pinch note is for SUMMER 93 on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {PINCH_TABLE_LINE} {PINCH_HISS_LINE} {PINCH_RADIO_LINE}{" "}
              {PINCH_STILL_LINE}
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

function PinchForm({
  listingId,
  isPinch,
}: {
  listingId: string;
  isPinch: boolean;
}) {
  return (
    <form
      method="post"
      action={listingPinchWritePath()}
      className="space-y-3"
      data-pinch-form={isPinch ? "open" : "pinch"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isPinch ? "open" : "pinch"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/pinch`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isPinch ? PINCH_LEAVE_LINE : PINCH_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isPinch
          ? "Clear the tape. Status and the tote stay put."
          : `${PINCH_STAYS_LINE} ${PINCH_HISS_LINE} ${PINCH_RADIO_LINE} ${PINCH_STILL_LINE} ${PINCH_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingPinchView({
  sheet,
  pinchIds,
}: {
  sheet: PinchViewSheet;
  pinchIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <PinchMissing />;
  }

  if (sheet.kind !== "physical") {
    return <PinchRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-pinch-sheet="physical"
      data-pinch-state={sheet.isPinch ? "pinch" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: PINCH_MIRROR_SCRIPT }} />
      <SyncPinch listingIds={pinchIds} />

      <MallHero>
        <MallCrumb label="I will not pinch it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Pinch</span>
        </MallCrumb>

        <MallEyebrow>I will not pinch it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isPinch ? PINCH_NOTICE_TITLE : PINCH_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {PINCH_TABLE_LINE} {PINCH_HISS_LINE} {PINCH_RADIO_LINE}{" "}
            {PINCH_WALK_LINE} {PINCH_STAYS_LINE} {PINCH_STILL_LINE}{" "}
            {PINCH_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-pinch-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isPinch ? (
              <Badge variant="outline">I will not pinch it</Badge>
            ) : (
              <Badge variant="ghost">Pinch not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Pinch paper
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
            {sheet.isPinch
              ? "Still for sale. Seller taped the pinch note. Status stays available. Not a shop."
              : "Still a hiss. Still a radio edit. Tape it when walkers still want the roller set."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isPinch ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not pinch it"
              title={PINCH_NOTICE_TITLE}
              body={`${PINCH_STILL_LINE} avail=open still lists this tape.`}
            />
          ) : (
            <ListingPinchEmpty listingId={sheet.listingId} />
          )}

          <PinchForm listingId={sheet.listingId} isPinch={sheet.isPinch} />

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
