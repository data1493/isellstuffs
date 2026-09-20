import Link from "next/link";

import { ListingChannelEmpty } from "@/components/listing-channel-empty";
import { SyncChannel } from "@/components/listing-channel-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  CHANNEL_FLEX_LINE,
  CHANNEL_LACES_LINE,
  CHANNEL_LEAVE_LINE,
  CHANNEL_MIRROR_SCRIPT,
  CHANNEL_NOTICE_TITLE,
  CHANNEL_REFUSE_COPY,
  CHANNEL_STAYS_LINE,
  CHANNEL_STILL_LINE,
  CHANNEL_TABLE_LINE,
  CHANNEL_TOTE_LINE,
  CHANNEL_WALK_LINE,
} from "@/lib/listing-channel";
import { listingChannelWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type ChannelViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "jacket"
  | "lid"
  | "chair"
  | "owned";

export type ChannelViewSheet = {
  kind: ChannelViewKind;
  listingId: string;
  isChannel: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function ChannelMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={CHANNEL_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function ChannelRefused({ sheet }: { sheet: ChannelViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const jacket = sheet.kind === "jacket";
  const lid = sheet.kind === "lid";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-channel-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : jacket
                ? "A jacket is not a pair"
                : lid
                  ? "A lid is not a pair"
                  : chair
                    ? "A chair is not a pair"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={CHANNEL_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A channel note is for the split-sole pair on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {CHANNEL_TABLE_LINE} {CHANNEL_FLEX_LINE} {CHANNEL_LACES_LINE}{" "}
              {CHANNEL_STILL_LINE}
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

function ChannelForm({
  listingId,
  isChannel,
}: {
  listingId: string;
  isChannel: boolean;
}) {
  return (
    <form
      method="post"
      action={listingChannelWritePath()}
      className="space-y-3"
      data-channel-form={isChannel ? "open" : "channel"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isChannel ? "open" : "channel"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/channel`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isChannel ? CHANNEL_LEAVE_LINE : CHANNEL_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isChannel
          ? "Clear the tape. Status and the tote stay put."
          : `${CHANNEL_STAYS_LINE} ${CHANNEL_FLEX_LINE} ${CHANNEL_LACES_LINE} ${CHANNEL_STILL_LINE} ${CHANNEL_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingChannelView({
  sheet,
  channelIds,
}: {
  sheet: ChannelViewSheet;
  channelIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <ChannelMissing />;
  }

  if (sheet.kind !== "physical") {
    return <ChannelRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-channel-sheet="physical"
      data-channel-state={sheet.isChannel ? "channel" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: CHANNEL_MIRROR_SCRIPT }} />
      <SyncChannel listingIds={channelIds} />

      <MallHero>
        <MallCrumb label="I will not channel them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Channel</span>
        </MallCrumb>

        <MallEyebrow>I will not channel them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isChannel ? CHANNEL_NOTICE_TITLE : CHANNEL_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {CHANNEL_TABLE_LINE} {CHANNEL_FLEX_LINE} {CHANNEL_LACES_LINE}{" "}
            {CHANNEL_WALK_LINE} {CHANNEL_STAYS_LINE} {CHANNEL_STILL_LINE}{" "}
            {CHANNEL_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-channel-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isChannel ? (
              <Badge variant="outline">I will not channel them</Badge>
            ) : (
              <Badge variant="ghost">Channel not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Channel paper
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
            {sheet.isChannel
              ? "Still for sale. Seller taped the channel note. Status stays available. Not a cobbler."
              : "Still a flex. Still original laces. Tape it when walkers still want a shop channel."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isChannel ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not channel them"
              title={CHANNEL_NOTICE_TITLE}
              body={`${CHANNEL_STILL_LINE} avail=open still lists this pair.`}
            />
          ) : (
            <ListingChannelEmpty listingId={sheet.listingId} />
          )}

          <ChannelForm listingId={sheet.listingId} isChannel={sheet.isChannel} />

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
