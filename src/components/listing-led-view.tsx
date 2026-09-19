import Link from "next/link";

import { ListingLedEmpty } from "@/components/listing-led-empty";
import { SyncLed } from "@/components/listing-led-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  LED_LIGHTS_LINE,
  LED_MIRROR_SCRIPT,
  LED_NECK_LINE,
  LED_NOTICE_TITLE,
  LED_REFUSE_COPY,
  LED_STAYS_LINE,
  LED_STILL_LINE,
  LED_TABLE_LINE,
  LED_TOTE_LINE,
  LED_WALK_LINE,
} from "@/lib/listing-led";
import { listingLedWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type LedViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type LedViewSheet = {
  kind: LedViewKind;
  listingId: string;
  isLed: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function LedMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={LED_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function LedRefused({ sheet }: { sheet: LedViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-led-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={LED_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A led note is for a lamp on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {LED_TABLE_LINE} {LED_NECK_LINE} {LED_LIGHTS_LINE} {LED_STILL_LINE}
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

function LedForm({
  listingId,
  isLed,
}: {
  listingId: string;
  isLed: boolean;
}) {
  return (
    <form
      method="post"
      action={listingLedWritePath()}
      className="space-y-3"
      data-led-form={isLed ? "open" : "led"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isLed ? "open" : "led"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/led`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isLed ? "Leave the twist" : "I will not LED it"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isLed
          ? "Clear the tape. Status and the tote stay put."
          : `${LED_STAYS_LINE} ${LED_NECK_LINE} ${LED_STILL_LINE} ${LED_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingLedView({
  sheet,
  ledIds,
}: {
  sheet: LedViewSheet;
  ledIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <LedMissing />;
  }

  if (sheet.kind !== "physical") {
    return <LedRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-led-sheet="physical"
      data-led-state={sheet.isLed ? "led" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: LED_MIRROR_SCRIPT }} />
      <SyncLed listingIds={ledIds} />

      <MallHero>
        <MallCrumb label="I will not LED it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Led</span>
        </MallCrumb>

        <MallEyebrow>I will not LED it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isLed ? LED_NOTICE_TITLE : LED_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {LED_TABLE_LINE} {LED_NECK_LINE} {LED_LIGHTS_LINE} {LED_WALK_LINE}{" "}
            {LED_STAYS_LINE} {LED_STILL_LINE} {LED_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-led-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isLed ? (
              <Badge variant="outline">I will not LED it</Badge>
            ) : (
              <Badge variant="ghost">Led not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Led paper
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
            {sheet.isLed
              ? "Still for sale. Seller taped the led note. Status stays available. Not a lighting shop."
              : "Twist the neck. Still lights. Tape it when walkers still want an LED swap."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isLed ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not LED it"
              title={LED_NOTICE_TITLE}
              body={`${LED_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingLedEmpty listingId={sheet.listingId} />
          )}

          <LedForm listingId={sheet.listingId} isLed={sheet.isLed} />

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
