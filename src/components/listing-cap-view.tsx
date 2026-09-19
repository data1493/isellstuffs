import Link from "next/link";

import { ListingCapEmpty } from "@/components/listing-cap-empty";
import { SyncCap } from "@/components/listing-cap-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  CAP_COFFEE_LINE,
  CAP_MIRROR_SCRIPT,
  CAP_NOTICE_TITLE,
  CAP_OPEN_LINE,
  CAP_REFUSE_COPY,
  CAP_STAYS_LINE,
  CAP_STILL_LINE,
  CAP_TABLE_LINE,
  CAP_TOTE_LINE,
  CAP_WALK_LINE,
} from "@/lib/listing-cap";
import { listingCapWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type CapViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type CapViewSheet = {
  kind: CapViewKind;
  listingId: string;
  isCap: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function CapMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={CAP_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function CapRefused({ sheet }: { sheet: CapViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-cap-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={CAP_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A cap note is for a diner mug on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {CAP_TABLE_LINE} {CAP_OPEN_LINE} {CAP_COFFEE_LINE} {CAP_STILL_LINE}
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

function CapForm({
  listingId,
  isCap,
}: {
  listingId: string;
  isCap: boolean;
}) {
  return (
    <form
      method="post"
      action={listingCapWritePath()}
      className="space-y-3"
      data-cap-form={isCap ? "open" : "cap"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isCap ? "open" : "cap"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/cap`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isCap ? "Leave it open" : "I don't have a cap"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isCap
          ? "Clear the tape. Status and the tote stay put."
          : `${CAP_STAYS_LINE} ${CAP_OPEN_LINE} ${CAP_STILL_LINE} ${CAP_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingCapView({
  sheet,
  capIds,
}: {
  sheet: CapViewSheet;
  capIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <CapMissing />;
  }

  if (sheet.kind !== "physical") {
    return <CapRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-cap-sheet="physical"
      data-cap-state={sheet.isCap ? "cap" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: CAP_MIRROR_SCRIPT }} />
      <SyncCap listingIds={capIds} />

      <MallHero>
        <MallCrumb label="I don't have a cap">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Cap</span>
        </MallCrumb>

        <MallEyebrow>I don't have a cap</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isCap ? CAP_NOTICE_TITLE : CAP_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {CAP_TABLE_LINE} {CAP_OPEN_LINE} {CAP_COFFEE_LINE} {CAP_WALK_LINE}{" "}
            {CAP_STAYS_LINE} {CAP_STILL_LINE} {CAP_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-cap-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isCap ? (
              <Badge variant="outline">I don't have a cap</Badge>
            ) : (
              <Badge variant="ghost">Cap not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Cap paper
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
            {sheet.isCap
              ? "Still for sale. Seller taped the cap note. Status stays available. Not a lid shop."
              : "Open mug. Still holds coffee. Tape it when walkers still want a travel lid."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isCap ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a cap"
              title={CAP_NOTICE_TITLE}
              body={`${CAP_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingCapEmpty listingId={sheet.listingId} />
          )}

          <CapForm listingId={sheet.listingId} isCap={sheet.isCap} />

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
