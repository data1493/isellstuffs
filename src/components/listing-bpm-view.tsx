import Link from "next/link";

import { ListingBpmEmpty } from "@/components/listing-bpm-empty";
import { SyncBpm } from "@/components/listing-bpm-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  BPM_CONVERT_LINE,
  BPM_MAP_LINE,
  BPM_MIRROR_SCRIPT,
  BPM_NOTICE_TITLE,
  BPM_REFUSE_COPY,
  BPM_STEMS_LINE,
  BPM_STILL_LINE,
  BPM_TABLE_LINE,
  BPM_TOTE_LINE,
} from "@/lib/listing-bpm";
import { listingBpmWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type BpmViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type BpmViewSheet = {
  kind: BpmViewKind;
  listingId: string;
  isBpm: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function BpmMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={BPM_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function BpmRefused({ sheet }: { sheet: BpmViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-bpm-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={BPM_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "BPM is a guess is for a file on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {BPM_TABLE_LINE} {BPM_MAP_LINE} {BPM_STEMS_LINE} {BPM_CONVERT_LINE}{" "}
              {BPM_STILL_LINE}
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

function BpmForm({
  listingId,
  isBpm,
}: {
  listingId: string;
  isBpm: boolean;
}) {
  return (
    <form
      method="post"
      action={listingBpmWritePath()}
      className="space-y-3"
      data-bpm-form={isBpm ? "open" : "bpm"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isBpm ? "open" : "bpm"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/bpm`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isBpm ? "Leave the loop" : "BPM is a guess"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isBpm
          ? "Clear the BPM paper. Status and the tote stay put."
          : `${BPM_TABLE_LINE} ${BPM_MAP_LINE} ${BPM_STEMS_LINE} ${BPM_CONVERT_LINE} ${BPM_STILL_LINE} ${BPM_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingBpmView({
  sheet,
  bpmIds,
}: {
  sheet: BpmViewSheet;
  bpmIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <BpmMissing />;
  }

  if (sheet.kind !== "digital") {
    return <BpmRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-bpm-sheet="digital"
      data-bpm-state={sheet.isBpm ? "bpm" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: BPM_MIRROR_SCRIPT }} />
      <SyncBpm listingIds={bpmIds} />

      <MallHero>
        <MallCrumb label="BPM is a guess">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">BPM</span>
        </MallCrumb>

        <MallEyebrow>BPM is a guess</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isBpm ? BPM_NOTICE_TITLE : BPM_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {BPM_TABLE_LINE} {BPM_MAP_LINE} {BPM_STEMS_LINE} {BPM_CONVERT_LINE}{" "}
            {BPM_STILL_LINE} {BPM_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-bpm-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isBpm ? (
              <Badge variant="outline">BPM is a guess</Badge>
            ) : (
              <Badge variant="ghost">Open to a tempo map</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            BPM paper
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
            {sheet.isBpm
              ? "Still for sale. Seller taped the loop stays a guess. Walkers still ask Beats for a session. Status stays available."
              : "Stems is twelve shots. Tape the BPM when the loop is a guess, not a map."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isBpm ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="BPM is a guess"
              title={BPM_NOTICE_TITLE}
              body={`${BPM_STILL_LINE} avail=open still lists this file. ${BPM_MAP_LINE}`}
            />
          ) : (
            <ListingBpmEmpty listingId={sheet.listingId} />
          )}

          <BpmForm listingId={sheet.listingId} isBpm={sheet.isBpm} />

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
