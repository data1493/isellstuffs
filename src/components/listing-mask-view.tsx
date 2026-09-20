import Link from "next/link";

import { ListingMaskEmpty } from "@/components/listing-mask-empty";
import { SyncMask } from "@/components/listing-mask-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  MASK_BOARD_LINE,
  MASK_FUSED_LINE,
  MASK_LEAVE_LINE,
  MASK_MIRROR_SCRIPT,
  MASK_NOTICE_TITLE,
  MASK_REFUSE_COPY,
  MASK_STAYS_LINE,
  MASK_STILL_LINE,
  MASK_TABLE_LINE,
  MASK_TOTE_LINE,
  MASK_WALK_LINE,
} from "@/lib/listing-mask";
import { listingMaskWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type MaskViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "lut"
  | "pack"
  | "owned";

export type MaskViewSheet = {
  kind: MaskViewKind;
  listingId: string;
  isMask: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function MaskMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={MASK_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function MaskRefused({ sheet }: { sheet: MaskViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const lut = sheet.kind === "lut";
  const pack = sheet.kind === "pack";
  const owned = sheet.kind === "owned";

  return (
    <div data-mask-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : lut
              ? "A LUT is not a board"
              : pack
                ? "A pack is not a board"
                : file
                  ? "Files stay in the folder"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={MASK_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A mask note is for the cracked Game Boy on the table, not a LUT and not a gift code."
              )}
            </p>
            <p>
              {MASK_TABLE_LINE} {MASK_BOARD_LINE} {MASK_FUSED_LINE}{" "}
              {MASK_STILL_LINE}
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

function MaskForm({
  listingId,
  isMask,
}: {
  listingId: string;
  isMask: boolean;
}) {
  return (
    <form
      method="post"
      action={listingMaskWritePath()}
      className="space-y-3"
      data-mask-form={isMask ? "open" : "mask"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isMask ? "open" : "mask"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/mask`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isMask ? MASK_LEAVE_LINE : MASK_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isMask
          ? "Clear the tape. Status and the tote stay put."
          : `${MASK_STAYS_LINE} ${MASK_BOARD_LINE} ${MASK_FUSED_LINE} ${MASK_STILL_LINE} ${MASK_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingMaskView({
  sheet,
  maskIds,
}: {
  sheet: MaskViewSheet;
  maskIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <MaskMissing />;
  }

  if (sheet.kind !== "physical") {
    return <MaskRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-mask-sheet="physical"
      data-mask-state={sheet.isMask ? "mask" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: MASK_MIRROR_SCRIPT }} />
      <SyncMask listingIds={maskIds} />

      <MallHero>
        <MallCrumb label="I will not mask it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Mask</span>
        </MallCrumb>

        <MallEyebrow>I will not mask it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isMask ? MASK_NOTICE_TITLE : MASK_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {MASK_TABLE_LINE} {MASK_BOARD_LINE} {MASK_FUSED_LINE}{" "}
            {MASK_WALK_LINE} {MASK_STAYS_LINE} {MASK_STILL_LINE}{" "}
            {MASK_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-mask-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isMask ? (
              <Badge variant="outline">I will not mask it</Badge>
            ) : (
              <Badge variant="ghost">Mask not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Mask paper
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
            {sheet.isMask
              ? "Still for sale. Seller taped the mask note. Status stays available. Not a conformal shop."
              : "Still a board. Still fused. Tape it when walkers still want the solder mask back."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isMask ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not mask it"
              title={MASK_NOTICE_TITLE}
              body={`${MASK_STILL_LINE} avail=open still lists this Game Boy.`}
            />
          ) : (
            <ListingMaskEmpty listingId={sheet.listingId} />
          )}

          <MaskForm listingId={sheet.listingId} isMask={sheet.isMask} />

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
