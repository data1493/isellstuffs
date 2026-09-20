import Link from "next/link";

import { ListingHotbarEmpty } from "@/components/listing-hotbar-empty";
import { SyncHotbar } from "@/components/listing-hotbar-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  HOTBAR_CRACK_LINE,
  HOTBAR_LEAVE_LINE,
  HOTBAR_MIRROR_SCRIPT,
  HOTBAR_NOTICE_TITLE,
  HOTBAR_REFUSE_COPY,
  HOTBAR_STAYS_LINE,
  HOTBAR_STILL_LINE,
  HOTBAR_TABLE_LINE,
  HOTBAR_TETRIS_LINE,
  HOTBAR_TOTE_LINE,
  HOTBAR_WALK_LINE,
} from "@/lib/listing-hotbar";
import { listingHotbarWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type HotbarViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "drawer"
  | "lid"
  | "owned";

export type HotbarViewSheet = {
  kind: HotbarViewKind;
  listingId: string;
  isHotbar: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function HotbarMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={HOTBAR_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function HotbarRefused({ sheet }: { sheet: HotbarViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const drawer = sheet.kind === "drawer";
  const lid = sheet.kind === "lid";
  const owned = sheet.kind === "owned";

  return (
    <div data-hotbar-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : drawer
                ? "A drawer is not a hotbar"
                : lid
                  ? "A lid is not a hotbar"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={HOTBAR_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A hotbar note is for the cracked Game Boy on the table, not a LUT and not a gift code."
              )}
            </p>
            <p>
              {HOTBAR_TABLE_LINE} {HOTBAR_CRACK_LINE} {HOTBAR_TETRIS_LINE}{" "}
              {HOTBAR_STILL_LINE}
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

function HotbarForm({
  listingId,
  isHotbar,
}: {
  listingId: string;
  isHotbar: boolean;
}) {
  return (
    <form
      method="post"
      action={listingHotbarWritePath()}
      className="space-y-3"
      data-hotbar-form={isHotbar ? "open" : "hotbar"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isHotbar ? "open" : "hotbar"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/hotbar`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isHotbar ? HOTBAR_LEAVE_LINE : HOTBAR_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isHotbar
          ? "Clear the tape. Status and the tote stay put."
          : `${HOTBAR_STAYS_LINE} ${HOTBAR_CRACK_LINE} ${HOTBAR_TETRIS_LINE} ${HOTBAR_STILL_LINE} ${HOTBAR_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingHotbarView({
  sheet,
  hotbarIds,
}: {
  sheet: HotbarViewSheet;
  hotbarIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <HotbarMissing />;
  }

  if (sheet.kind !== "physical") {
    return <HotbarRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-hotbar-sheet="physical"
      data-hotbar-state={sheet.isHotbar ? "hotbar" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: HOTBAR_MIRROR_SCRIPT }} />
      <SyncHotbar listingIds={hotbarIds} />

      <MallHero>
        <MallCrumb label="I will not hotbar it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Hotbar</span>
        </MallCrumb>

        <MallEyebrow>I will not hotbar it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isHotbar ? HOTBAR_NOTICE_TITLE : HOTBAR_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {HOTBAR_TABLE_LINE} {HOTBAR_CRACK_LINE} {HOTBAR_TETRIS_LINE}{" "}
            {HOTBAR_WALK_LINE} {HOTBAR_STAYS_LINE} {HOTBAR_STILL_LINE}{" "}
            {HOTBAR_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-hotbar-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isHotbar ? (
              <Badge variant="outline">I will not hotbar it</Badge>
            ) : (
              <Badge variant="ghost">Hotbar not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Hotbar paper
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
            {sheet.isHotbar
              ? "Still for sale. Seller taped the hotbar note. Status stays available. Not a shop."
              : "Still a crack. Still Tetris. Tape it when walkers still want a shop pulse-bond."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isHotbar ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not hotbar it"
              title={HOTBAR_NOTICE_TITLE}
              body={`${HOTBAR_STILL_LINE} avail=open still lists this Game Boy.`}
            />
          ) : (
            <ListingHotbarEmpty listingId={sheet.listingId} />
          )}

          <HotbarForm listingId={sheet.listingId} isHotbar={sheet.isHotbar} />

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
