import Link from "next/link";

import { ListingLatheEmpty } from "@/components/listing-lathe-empty";
import { SyncLathe } from "@/components/listing-lathe-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  LATHE_LEAVE_LINE,
  LATHE_MIRROR_SCRIPT,
  LATHE_NOTICE_TITLE,
  LATHE_REFUSE_COPY,
  LATHE_SCRATCHED_LINE,
  LATHE_SHARPIE_LINE,
  LATHE_STAYS_LINE,
  LATHE_STILL_LINE,
  LATHE_TABLE_LINE,
  LATHE_TOTE_LINE,
  LATHE_WALK_LINE,
} from "@/lib/listing-lathe";
import { listingLatheWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type LatheViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type LatheViewSheet = {
  kind: LatheViewKind;
  listingId: string;
  isLathe: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function LatheMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={LATHE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function LatheRefused({ sheet }: { sheet: LatheViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-lathe-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={LATHE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A lathe note is for a disc on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {LATHE_TABLE_LINE} {LATHE_SCRATCHED_LINE} {LATHE_SHARPIE_LINE}{" "}
              {LATHE_STILL_LINE}
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

function LatheForm({
  listingId,
  isLathe,
}: {
  listingId: string;
  isLathe: boolean;
}) {
  return (
    <form
      method="post"
      action={listingLatheWritePath()}
      className="space-y-3"
      data-lathe-form={isLathe ? "open" : "lathe"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isLathe ? "open" : "lathe"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/lathe`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isLathe ? LATHE_LEAVE_LINE : LATHE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isLathe
          ? "Clear the tape. Status and the tote stay put."
          : `${LATHE_STAYS_LINE} ${LATHE_SCRATCHED_LINE} ${LATHE_SHARPIE_LINE} ${LATHE_STILL_LINE} ${LATHE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingLatheView({
  sheet,
  latheIds,
}: {
  sheet: LatheViewSheet;
  latheIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <LatheMissing />;
  }

  if (sheet.kind !== "physical") {
    return <LatheRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-lathe-sheet="physical"
      data-lathe-state={sheet.isLathe ? "lathe" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: LATHE_MIRROR_SCRIPT }} />
      <SyncLathe listingIds={latheIds} />

      <MallHero>
        <MallCrumb label="I will not lathe it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Lathe</span>
        </MallCrumb>

        <MallEyebrow>I will not lathe it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isLathe ? LATHE_NOTICE_TITLE : LATHE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {LATHE_TABLE_LINE} {LATHE_SCRATCHED_LINE} {LATHE_SHARPIE_LINE}{" "}
            {LATHE_WALK_LINE} {LATHE_STAYS_LINE} {LATHE_STILL_LINE} {LATHE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-lathe-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isLathe ? (
              <Badge variant="outline">I will not lathe it</Badge>
            ) : (
              <Badge variant="ghost">Lathe not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Lathe paper
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
            {sheet.isLathe
              ? "Still for sale. Seller taped the lathe note. Status stays available. Not a shop."
              : "Still scratched. Still Sharpie. Tape it when walkers still want the disc lathed."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isLathe ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not lathe it"
              title={LATHE_NOTICE_TITLE}
              body={`${LATHE_STILL_LINE} avail=open still lists this disc.`}
            />
          ) : (
            <ListingLatheEmpty listingId={sheet.listingId} />
          )}

          <LatheForm listingId={sheet.listingId} isLathe={sheet.isLathe} />

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
