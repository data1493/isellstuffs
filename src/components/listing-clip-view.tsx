import Link from "next/link";

import { ListingClipEmpty } from "@/components/listing-clip-empty";
import { SyncClip } from "@/components/listing-clip-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  CLIP_MIRROR_SCRIPT,
  CLIP_PAPER_LINE,
  CLIP_REFUSE_COPY,
  CLIP_REMOTE_LINE,
  CLIP_STACK_LINE,
  CLIP_STILL_LINE,
  CLIP_TABLE_LINE,
  CLIP_TOTE_LINE,
} from "@/lib/listing-clip";
import { listingClipWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type ClipViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type ClipViewSheet = {
  kind: ClipViewKind;
  listingId: string;
  isClip: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function ClipMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={CLIP_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function ClipRefused({ sheet }: { sheet: ClipViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-clip-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={CLIP_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "The clip walked is for a scanned stack on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {CLIP_TABLE_LINE} {CLIP_PAPER_LINE} {CLIP_REMOTE_LINE}{" "}
              {CLIP_STACK_LINE} {CLIP_STILL_LINE}
            </p>
          </div>
        }
        actions={
          <>
            {sheet.listing ? (
              <Button
                className="rounded-full px-5"
                render={<Link href={listingPath(sheet.listing.id)} />}
              >
                Back to the listing
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="rounded-full px-5"
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

function ClipForm({
  listingId,
  isClip,
}: {
  listingId: string;
  isClip: boolean;
}) {
  return (
    <form
      method="post"
      action={listingClipWritePath()}
      className="space-y-3"
      data-clip-form={isClip ? "open" : "clip"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isClip ? "open" : "clip"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/clip`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isClip ? "The clip is back" : "The clip walked"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isClip
          ? "Clear the clip paper. Status and the tote stay put."
          : `${CLIP_PAPER_LINE} ${CLIP_REMOTE_LINE} ${CLIP_STACK_LINE} ${CLIP_STILL_LINE} ${CLIP_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingClipView({
  sheet,
  clipIds,
}: {
  sheet: ClipViewSheet;
  clipIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <ClipMissing />;
  }

  if (sheet.kind !== "digital") {
    return <ClipRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-clip-sheet="digital"
      data-clip-state={sheet.isClip ? "clip" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: CLIP_MIRROR_SCRIPT }} />
      <SyncClip listingIds={clipIds} />

      <MallHero>
        <MallCrumb label="The clip walked">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Clip</span>
        </MallCrumb>

        <MallEyebrow>The clip walked</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isClip ? CLIP_TABLE_LINE : "The binder clip is gone."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {CLIP_TABLE_LINE} {CLIP_PAPER_LINE} {CLIP_REMOTE_LINE}{" "}
            {CLIP_STACK_LINE} {CLIP_STILL_LINE} {CLIP_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-clip-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isClip ? (
              <Badge variant="outline">The clip walked</Badge>
            ) : (
              <Badge variant="ghost">Clip still on</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Clip paper
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
            {sheet.isClip
              ? "Still for sale. Seller taped the missing clip. Walkers still ask Sink Drawer for a binder. Status stays available."
              : "The paper clip walked. Tape it when the recipe stack is loose."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isClip ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="The clip walked"
              title={CLIP_TABLE_LINE}
              body={`${CLIP_STILL_LINE} avail=open still lists this file. ${CLIP_STACK_LINE}`}
            />
          ) : (
            <ListingClipEmpty listingId={sheet.listingId} />
          )}

          <ClipForm listingId={sheet.listingId} isClip={sheet.isClip} />

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={listingPath(sheet.listingId)} />}
            >
              Back to the listing
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={exploreHref({ avail: "open" })} />}
            >
              Still here on the concourse
            </Button>
            {stallHref ? (
              <Button
                variant="outline"
                className="w-full rounded-full sm:w-auto"
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
