import Link from "next/link";

import { ListingCrushEmpty } from "@/components/listing-crush-empty";
import { SyncCrush } from "@/components/listing-crush-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  CRUSH_LEAVE_LINE,
  CRUSH_MIRROR_SCRIPT,
  CRUSH_NOTICE_TITLE,
  CRUSH_REFUSE_COPY,
  CRUSH_SHOTS_LINE,
  CRUSH_STAYS_LINE,
  CRUSH_STILL_LINE,
  CRUSH_TABLE_LINE,
  CRUSH_TOTE_LINE,
  CRUSH_WALK_LINE,
  CRUSH_ZIP_LINE,
} from "@/lib/listing-crush";
import { listingCrushWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type CrushViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type CrushViewSheet = {
  kind: CrushViewKind;
  listingId: string;
  isCrush: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function CrushMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={CRUSH_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function CrushRefused({ sheet }: { sheet: CrushViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-crush-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={CRUSH_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Crush honesty is for a file on the digital lot, not a CD-R and not a gift code."
              )}
            </p>
            <p>
              {CRUSH_TABLE_LINE} {CRUSH_SHOTS_LINE} {CRUSH_ZIP_LINE} {CRUSH_STILL_LINE}
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

function CrushForm({
  listingId,
  isCrush,
}: {
  listingId: string;
  isCrush: boolean;
}) {
  return (
    <form
      method="post"
      action={listingCrushWritePath()}
      className="space-y-3"
      data-crush-form={isCrush ? "open" : "crush"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isCrush ? "open" : "crush"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/crush`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isCrush ? CRUSH_LEAVE_LINE : CRUSH_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isCrush
          ? "Clear the tape. Status and the tote stay put."
          : `${CRUSH_STAYS_LINE} ${CRUSH_SHOTS_LINE} ${CRUSH_ZIP_LINE} ${CRUSH_STILL_LINE} ${CRUSH_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingCrushView({
  sheet,
  crushIds,
}: {
  sheet: CrushViewSheet;
  crushIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <CrushMissing />;
  }

  if (sheet.kind !== "digital") {
    return <CrushRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-crush-sheet="digital"
      data-crush-state={sheet.isCrush ? "crush" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: CRUSH_MIRROR_SCRIPT }} />
      <SyncCrush listingIds={crushIds} />

      <MallHero>
        <MallCrumb label="I will not crush it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Crush</span>
        </MallCrumb>

        <MallEyebrow>I will not crush it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isCrush ? CRUSH_NOTICE_TITLE : CRUSH_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {CRUSH_TABLE_LINE} {CRUSH_SHOTS_LINE} {CRUSH_ZIP_LINE} {CRUSH_WALK_LINE}{" "}
            {CRUSH_STAYS_LINE} {CRUSH_STILL_LINE} {CRUSH_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-crush-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isCrush ? (
              <Badge variant="outline">I will not crush it</Badge>
            ) : (
              <Badge variant="ghost">Still a zip</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Crush paper
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
            {sheet.isCrush
              ? "Still for sale. Seller taped the crush note. Status stays available. Not a mix desk."
              : "Twelve shots. Still a zip. Tape it when walkers still want the kicks crushed."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isCrush ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not crush it"
              title={CRUSH_NOTICE_TITLE}
              body={`${CRUSH_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingCrushEmpty listingId={sheet.listingId} />
          )}

          <CrushForm listingId={sheet.listingId} isCrush={sheet.isCrush} />

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
