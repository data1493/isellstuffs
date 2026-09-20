import Link from "next/link";

import { ListingGangEmpty } from "@/components/listing-gang-empty";
import { SyncGang } from "@/components/listing-gang-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  GANG_CARDS_LINE,
  GANG_GREASE_LINE,
  GANG_LEAVE_LINE,
  GANG_MIRROR_SCRIPT,
  GANG_NOTICE_TITLE,
  GANG_REFUSE_COPY,
  GANG_STAYS_LINE,
  GANG_STILL_LINE,
  GANG_TABLE_LINE,
  GANG_TOTE_LINE,
  GANG_WALK_LINE,
} from "@/lib/listing-gang";
import { listingGangWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type GangViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "owned";

export type GangViewSheet = {
  kind: GangViewKind;
  listingId: string;
  isGang: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function GangMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={GANG_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function GangRefused({ sheet }: { sheet: GangViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const owned = sheet.kind === "owned";

  return (
    <div data-gang-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : owned
              ? "Another note already owns that one"
              : object
                ? "On the table"
                : "Walked"
        }
        title={GANG_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A gang note is for three recipe cards, not a liner and not a gift code."
              )}
            </p>
            <p>
              {GANG_TABLE_LINE} {GANG_CARDS_LINE} {GANG_GREASE_LINE}{" "}
              {GANG_STILL_LINE}
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

function GangForm({
  listingId,
  isGang,
}: {
  listingId: string;
  isGang: boolean;
}) {
  return (
    <form
      method="post"
      action={listingGangWritePath()}
      className="space-y-3"
      data-gang-form={isGang ? "open" : "gang"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isGang ? "open" : "gang"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/gang`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isGang ? GANG_LEAVE_LINE : GANG_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isGang
          ? "Clear the tape. Status and the tote stay put."
          : `${GANG_STAYS_LINE} ${GANG_CARDS_LINE} ${GANG_GREASE_LINE} ${GANG_STILL_LINE} ${GANG_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingGangView({
  sheet,
  gangIds,
}: {
  sheet: GangViewSheet;
  gangIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <GangMissing />;
  }

  if (sheet.kind !== "digital") {
    return <GangRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-gang-sheet="digital"
      data-gang-state={sheet.isGang ? "gang" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: GANG_MIRROR_SCRIPT }} />
      <SyncGang listingIds={gangIds} />

      <MallHero>
        <MallCrumb label="I will not gang them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Gang</span>
        </MallCrumb>

        <MallEyebrow>I will not gang them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isGang ? GANG_NOTICE_TITLE : GANG_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {GANG_TABLE_LINE} {GANG_CARDS_LINE} {GANG_GREASE_LINE}{" "}
            {GANG_WALK_LINE} {GANG_STAYS_LINE} {GANG_STILL_LINE}{" "}
            {GANG_TOTE_LINE} Print imposition of three cards, not a login.
            Register stays print bars.
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-gang-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isGang ? (
              <Badge variant="outline">I will not gang them</Badge>
            ) : (
              <Badge variant="ghost">Still three cards</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Gang paper
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
            {sheet.isGang
              ? "Still for sale. Seller taped the gang note. Status stays available. Not a shop gang."
              : "Still three cards. Still grease. Tape it when walkers still want the three cards ganged."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isGang ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not gang them"
              title={GANG_NOTICE_TITLE}
              body={`${GANG_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingGangEmpty listingId={sheet.listingId} />
          )}

          <GangForm listingId={sheet.listingId} isGang={sheet.isGang} />

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
