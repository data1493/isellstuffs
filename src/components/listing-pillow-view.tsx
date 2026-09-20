import Link from "next/link";

import { ListingPillowEmpty } from "@/components/listing-pillow-empty";
import { SyncPillow } from "@/components/listing-pillow-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  PILLOW_CRACK_LINE,
  PILLOW_LEAVE_LINE,
  PILLOW_MIRROR_SCRIPT,
  PILLOW_NOTICE_TITLE,
  PILLOW_REFUSE_COPY,
  PILLOW_STAYS_LINE,
  PILLOW_STILL_LINE,
  PILLOW_TABLE_LINE,
  PILLOW_TETRIS_LINE,
  PILLOW_TOTE_LINE,
  PILLOW_WALK_LINE,
} from "@/lib/listing-pillow";
import { listingPath, listingPillowWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type PillowViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "drawer"
  | "lid"
  | "owned";

export type PillowViewSheet = {
  kind: PillowViewKind;
  listingId: string;
  isPillow: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function PillowMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={PILLOW_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function PillowRefused({ sheet }: { sheet: PillowViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const drawer = sheet.kind === "drawer";
  const lid = sheet.kind === "lid";
  const owned = sheet.kind === "owned";

  return (
    <div data-pillow-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : drawer
                ? "A drawer is not a pillow"
                : lid
                  ? "A lid is not a pillow"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={PILLOW_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A pillow note is for the cracked Game Boy on the table, not a LUT and not a gift code."
              )}
            </p>
            <p>
              {PILLOW_TABLE_LINE} {PILLOW_CRACK_LINE} {PILLOW_TETRIS_LINE}{" "}
              {PILLOW_STILL_LINE}
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

function PillowForm({
  listingId,
  isPillow,
}: {
  listingId: string;
  isPillow: boolean;
}) {
  return (
    <form
      method="post"
      action={listingPillowWritePath()}
      className="space-y-3"
      data-pillow-form={isPillow ? "open" : "pillow"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isPillow ? "open" : "pillow"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/pillow`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isPillow ? PILLOW_LEAVE_LINE : PILLOW_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isPillow
          ? "Clear the tape. Status and the tote stay put."
          : `${PILLOW_STAYS_LINE} ${PILLOW_CRACK_LINE} ${PILLOW_TETRIS_LINE} ${PILLOW_STILL_LINE} ${PILLOW_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingPillowView({
  sheet,
  pillowIds,
}: {
  sheet: PillowViewSheet;
  pillowIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <PillowMissing />;
  }

  if (sheet.kind !== "physical") {
    return <PillowRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-pillow-sheet="physical"
      data-pillow-state={sheet.isPillow ? "pillow" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: PILLOW_MIRROR_SCRIPT }} />
      <SyncPillow listingIds={pillowIds} />

      <MallHero>
        <MallCrumb label="I will not pillow it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Pillow</span>
        </MallCrumb>

        <MallEyebrow>I will not pillow it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isPillow ? PILLOW_NOTICE_TITLE : PILLOW_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {PILLOW_TABLE_LINE} {PILLOW_CRACK_LINE} {PILLOW_TETRIS_LINE}{" "}
            {PILLOW_WALK_LINE} {PILLOW_STAYS_LINE} {PILLOW_STILL_LINE}{" "}
            {PILLOW_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-pillow-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isPillow ? (
              <Badge variant="outline">I will not pillow it</Badge>
            ) : (
              <Badge variant="ghost">Pillow not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Pillow paper
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
            {sheet.isPillow
              ? "Still for sale. Seller taped the pillow note. Status stays available. Not a shop."
              : "Still a crack. Still Tetris. Tape it when walkers still want the BGA left head-in-pillow."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isPillow ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not pillow it"
              title={PILLOW_NOTICE_TITLE}
              body={`${PILLOW_STILL_LINE} avail=open still lists this Game Boy.`}
            />
          ) : (
            <ListingPillowEmpty listingId={sheet.listingId} />
          )}

          <PillowForm listingId={sheet.listingId} isPillow={sheet.isPillow} />

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
