import Link from "next/link";

import { ListingVibeEmpty } from "@/components/listing-vibe-empty";
import { SyncVibe } from "@/components/listing-vibe-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  VIBE_COOKBOOK_LINE,
  VIBE_INCH_LINE,
  VIBE_MIRROR_SCRIPT,
  VIBE_REFUSE_COPY,
  VIBE_SIZE_LINE,
  VIBE_STILL_LINE,
  VIBE_TABLE_LINE,
  VIBE_TOTE_LINE,
} from "@/lib/listing-vibe";
import { listingPath, listingVibeWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type VibeViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type VibeViewSheet = {
  kind: VibeViewKind;
  listingId: string;
  isVibe: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function VibeMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={VIBE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function VibeRefused({ sheet }: { sheet: VibeViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-vibe-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={VIBE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Measurements are vibes is for a scanned card on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {VIBE_TABLE_LINE} {VIBE_COOKBOOK_LINE} {VIBE_SIZE_LINE}{" "}
              {VIBE_INCH_LINE} {VIBE_STILL_LINE}
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

function VibeForm({
  listingId,
  isVibe,
}: {
  listingId: string;
  isVibe: boolean;
}) {
  return (
    <form
      method="post"
      action={listingVibeWritePath()}
      className="space-y-3"
      data-vibe-form={isVibe ? "open" : "vibe"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isVibe ? "open" : "vibe"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/vibe`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isVibe ? "Take the vibes tape off" : "Measurements are vibes"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isVibe
          ? "Clear the vibe paper. Status and the tote stay put."
          : `${VIBE_COOKBOOK_LINE} ${VIBE_SIZE_LINE} ${VIBE_INCH_LINE} ${VIBE_STILL_LINE} ${VIBE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingVibeView({
  sheet,
  vibeIds,
}: {
  sheet: VibeViewSheet;
  vibeIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <VibeMissing />;
  }

  if (sheet.kind !== "digital") {
    return <VibeRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-vibe-sheet="digital"
      data-vibe-state={sheet.isVibe ? "vibe" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: VIBE_MIRROR_SCRIPT }} />
      <SyncVibe listingIds={vibeIds} />

      <MallHero>
        <MallCrumb label="Measurements are vibes">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Vibe</span>
        </MallCrumb>

        <MallEyebrow>Measurements are vibes</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isVibe ? VIBE_TABLE_LINE : "I don't measure."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {VIBE_TABLE_LINE} {VIBE_COOKBOOK_LINE} {VIBE_SIZE_LINE}{" "}
            {VIBE_INCH_LINE} {VIBE_STILL_LINE} {VIBE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-vibe-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isVibe ? (
              <Badge variant="outline">Vibes</Badge>
            ) : (
              <Badge variant="ghost">Open to measure</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Vibe paper
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
            {sheet.isVibe
              ? "Still for sale. Seller taped vibes. Walkers still ask Sink Drawer for cups. Status stays available."
              : "I don't measure. Tape the vibes when the cards will not give inches."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isVibe ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Measurements are vibes"
              title={VIBE_TABLE_LINE}
              body={`${VIBE_STILL_LINE} avail=open still lists this file. ${VIBE_COOKBOOK_LINE}`}
            />
          ) : (
            <ListingVibeEmpty listingId={sheet.listingId} />
          )}

          <VibeForm listingId={sheet.listingId} isVibe={sheet.isVibe} />

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
