import Link from "next/link";

import { ListingRumbleEmpty } from "@/components/listing-rumble-empty";
import { SyncRumble } from "@/components/listing-rumble-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  RUMBLE_LEAVE_LINE,
  RUMBLE_MIRROR_SCRIPT,
  RUMBLE_NOTICE_TITLE,
  RUMBLE_REFUSE_COPY,
  RUMBLE_SKIP_LINE,
  RUMBLE_STAYS_LINE,
  RUMBLE_STILL_LINE,
  RUMBLE_TABLE_LINE,
  RUMBLE_TOTE_LINE,
  RUMBLE_UNNAMED_LINE,
  RUMBLE_WALK_LINE,
} from "@/lib/listing-rumble";
import { listingPath, listingRumbleWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type RumbleViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

export type RumbleViewSheet = {
  kind: RumbleViewKind;
  listingId: string;
  isRumble: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function RumbleMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={RUMBLE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function RumbleRefused({ sheet }: { sheet: RumbleViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const mixtape = sheet.kind === "mixtape";
  const jewels = sheet.kind === "jewels";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-rumble-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : mixtape
                ? "A mixtape is not an LP"
                : jewels
                  ? "Empty jewels are not an LP"
                  : chair
                    ? "A chair is not an LP"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={RUMBLE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A rumble note is for the unnamed LP on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {RUMBLE_TABLE_LINE} {RUMBLE_UNNAMED_LINE} {RUMBLE_SKIP_LINE}{" "}
              {RUMBLE_STILL_LINE}
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

function RumbleForm({
  listingId,
  isRumble,
}: {
  listingId: string;
  isRumble: boolean;
}) {
  return (
    <form
      method="post"
      action={listingRumbleWritePath()}
      className="space-y-3"
      data-rumble-form={isRumble ? "open" : "rumble"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isRumble ? "open" : "rumble"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/rumble`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isRumble ? RUMBLE_LEAVE_LINE : RUMBLE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isRumble
          ? "Clear the tape. Status and the tote stay put."
          : `${RUMBLE_STAYS_LINE} ${RUMBLE_UNNAMED_LINE} ${RUMBLE_SKIP_LINE} ${RUMBLE_STILL_LINE} ${RUMBLE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingRumbleView({
  sheet,
  rumbleIds,
}: {
  sheet: RumbleViewSheet;
  rumbleIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <RumbleMissing />;
  }

  if (sheet.kind !== "physical") {
    return <RumbleRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-rumble-sheet="physical"
      data-rumble-state={sheet.isRumble ? "rumble" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: RUMBLE_MIRROR_SCRIPT }} />
      <SyncRumble listingIds={rumbleIds} />

      <MallHero>
        <MallCrumb label="I will not rumble it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Rumble</span>
        </MallCrumb>

        <MallEyebrow>I will not rumble it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isRumble ? RUMBLE_NOTICE_TITLE : RUMBLE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {RUMBLE_TABLE_LINE} {RUMBLE_UNNAMED_LINE} {RUMBLE_SKIP_LINE}{" "}
            {RUMBLE_WALK_LINE} {RUMBLE_STAYS_LINE} {RUMBLE_STILL_LINE}{" "}
            {RUMBLE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-rumble-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isRumble ? (
              <Badge variant="outline">I will not rumble it</Badge>
            ) : (
              <Badge variant="ghost">Rumble not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Rumble paper
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
            {sheet.isRumble
              ? "Still for sale. Seller taped the rumble note. Status stays available. Not a shop."
              : "Still unnamed. Still a skip. Tape it when walkers still want a shop rumble filter."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isRumble ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not rumble it"
              title={RUMBLE_NOTICE_TITLE}
              body={`${RUMBLE_STILL_LINE} avail=open still lists this LP.`}
            />
          ) : (
            <ListingRumbleEmpty listingId={sheet.listingId} />
          )}

          <RumbleForm listingId={sheet.listingId} isRumble={sheet.isRumble} />

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
