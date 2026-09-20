import Link from "next/link";

import { ListingBillboardEmpty } from "@/components/listing-billboard-empty";
import { SyncBillboard } from "@/components/listing-billboard-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  BILLBOARD_CRACK_LINE,
  BILLBOARD_LEAVE_LINE,
  BILLBOARD_MIRROR_SCRIPT,
  BILLBOARD_NOTICE_TITLE,
  BILLBOARD_REFUSE_COPY,
  BILLBOARD_STAYS_LINE,
  BILLBOARD_STILL_LINE,
  BILLBOARD_TABLE_LINE,
  BILLBOARD_TETRIS_LINE,
  BILLBOARD_TOTE_LINE,
  BILLBOARD_WALK_LINE,
} from "@/lib/listing-billboard";
import { listingBillboardWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type BillboardViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "drawer"
  | "lid"
  | "owned";

export type BillboardViewSheet = {
  kind: BillboardViewKind;
  listingId: string;
  isBillboard: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function BillboardMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={BILLBOARD_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function BillboardRefused({ sheet }: { sheet: BillboardViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const drawer = sheet.kind === "drawer";
  const lid = sheet.kind === "lid";
  const owned = sheet.kind === "owned";

  return (
    <div data-billboard-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : drawer
                ? "A drawer is not a billboard"
                : lid
                  ? "A lid is not a billboard"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={BILLBOARD_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A billboard note is for the cracked Game Boy on the table, not a LUT and not a gift code."
              )}
            </p>
            <p>
              {BILLBOARD_TABLE_LINE} {BILLBOARD_CRACK_LINE} {BILLBOARD_TETRIS_LINE}{" "}
              {BILLBOARD_STILL_LINE}
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

function BillboardForm({
  listingId,
  isBillboard,
}: {
  listingId: string;
  isBillboard: boolean;
}) {
  return (
    <form
      method="post"
      action={listingBillboardWritePath()}
      className="space-y-3"
      data-billboard-form={isBillboard ? "open" : "billboard"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isBillboard ? "open" : "billboard"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/billboard`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isBillboard ? BILLBOARD_LEAVE_LINE : BILLBOARD_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isBillboard
          ? "Clear the tape. Status and the tote stay put."
          : `${BILLBOARD_STAYS_LINE} ${BILLBOARD_CRACK_LINE} ${BILLBOARD_TETRIS_LINE} ${BILLBOARD_STILL_LINE} ${BILLBOARD_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingBillboardView({
  sheet,
  billboardIds,
}: {
  sheet: BillboardViewSheet;
  billboardIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <BillboardMissing />;
  }

  if (sheet.kind !== "physical") {
    return <BillboardRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-billboard-sheet="physical"
      data-billboard-state={sheet.isBillboard ? "billboard" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: BILLBOARD_MIRROR_SCRIPT }} />
      <SyncBillboard listingIds={billboardIds} />

      <MallHero>
        <MallCrumb label="I will not billboard it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Billboard</span>
        </MallCrumb>

        <MallEyebrow>I will not billboard it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isBillboard ? BILLBOARD_NOTICE_TITLE : BILLBOARD_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {BILLBOARD_TABLE_LINE} {BILLBOARD_CRACK_LINE} {BILLBOARD_TETRIS_LINE}{" "}
            {BILLBOARD_WALK_LINE} {BILLBOARD_STAYS_LINE} {BILLBOARD_STILL_LINE}{" "}
            {BILLBOARD_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-billboard-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isBillboard ? (
              <Badge variant="outline">I will not billboard it</Badge>
            ) : (
              <Badge variant="ghost">Billboard not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Billboard paper
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
            {sheet.isBillboard
              ? "Still for sale. Seller taped the billboard note. Status stays available. Not a shop."
              : "Still a crack. Still Tetris. Tape it when walkers still want the chip stood on its long edge."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isBillboard ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not billboard it"
              title={BILLBOARD_NOTICE_TITLE}
              body={`${BILLBOARD_STILL_LINE} avail=open still lists this Game Boy.`}
            />
          ) : (
            <ListingBillboardEmpty listingId={sheet.listingId} />
          )}

          <BillboardForm listingId={sheet.listingId} isBillboard={sheet.isBillboard} />

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
