import Link from "next/link";

import { ListingSaturateEmpty } from "@/components/listing-saturate-empty";
import { SyncSaturate } from "@/components/listing-saturate-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  SATURATE_LEAVE_LINE,
  SATURATE_MIRROR_SCRIPT,
  SATURATE_NOTICE_TITLE,
  SATURATE_REFUSE_COPY,
  SATURATE_SHOTS_LINE,
  SATURATE_STAYS_LINE,
  SATURATE_STILL_LINE,
  SATURATE_TABLE_LINE,
  SATURATE_TOTE_LINE,
  SATURATE_WALK_LINE,
  SATURATE_ZIP_LINE,
} from "@/lib/listing-saturate";
import { listingPath, listingSaturateWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type SaturateViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "font"
  | "lut"
  | "missing";

export type SaturateViewSheet = {
  kind: SaturateViewKind;
  listingId: string;
  isSaturate: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function SaturateMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={SATURATE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function SaturateRefused({ sheet }: { sheet: SaturateViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const font = sheet.kind === "font";
  const lut = sheet.kind === "lut";

  return (
    <div data-saturate-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : font
              ? "Booth font"
              : lut
                ? "LUT pack"
                : object
                  ? "On the table"
                  : "Walked"
        }
        title={SATURATE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A saturate note is for twelve shots and a zip, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {SATURATE_TABLE_LINE} {SATURATE_SHOTS_LINE} {SATURATE_ZIP_LINE}{" "}
              {SATURATE_STILL_LINE}
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

function SaturateForm({
  listingId,
  isSaturate,
}: {
  listingId: string;
  isSaturate: boolean;
}) {
  return (
    <form
      method="post"
      action={listingSaturateWritePath()}
      className="space-y-3"
      data-saturate-form={isSaturate ? "open" : "saturate"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isSaturate ? "open" : "saturate"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/saturate`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isSaturate ? SATURATE_LEAVE_LINE : SATURATE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isSaturate
          ? "Clear the tape. Status and the tote stay put."
          : `${SATURATE_STAYS_LINE} ${SATURATE_SHOTS_LINE} ${SATURATE_ZIP_LINE} ${SATURATE_STILL_LINE} ${SATURATE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingSaturateView({
  sheet,
  saturateIds,
}: {
  sheet: SaturateViewSheet;
  saturateIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <SaturateMissing />;
  }

  if (sheet.kind !== "digital") {
    return <SaturateRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-saturate-sheet="digital"
      data-saturate-state={sheet.isSaturate ? "saturate" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: SATURATE_MIRROR_SCRIPT }} />
      <SyncSaturate listingIds={saturateIds} />

      <MallHero>
        <MallCrumb label="I will not saturate them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Saturate</span>
        </MallCrumb>

        <MallEyebrow>I will not saturate them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isSaturate ? SATURATE_NOTICE_TITLE : SATURATE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SATURATE_TABLE_LINE} {SATURATE_SHOTS_LINE} {SATURATE_ZIP_LINE}{" "}
            {SATURATE_WALK_LINE} {SATURATE_STAYS_LINE} {SATURATE_STILL_LINE}{" "}
            {SATURATE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-saturate-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isSaturate ? (
              <Badge variant="outline">I will not saturate them</Badge>
            ) : (
              <Badge variant="ghost">Still twelve shots</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Saturate paper
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
            {sheet.isSaturate
              ? "Still for sale. Seller taped the saturate note. Status stays available. Not a mix."
              : "Still twelve shots. Still a zip. Tape it when walkers still want the kicks browned."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isSaturate ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not saturate them"
              title={SATURATE_NOTICE_TITLE}
              body={`${SATURATE_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingSaturateEmpty listingId={sheet.listingId} />
          )}

          <SaturateForm listingId={sheet.listingId} isSaturate={sheet.isSaturate} />

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
