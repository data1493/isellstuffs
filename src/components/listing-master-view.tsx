import Link from "next/link";

import { ListingMasterEmpty } from "@/components/listing-master-empty";
import { SyncMaster } from "@/components/listing-master-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  MASTER_BURN_LINE,
  MASTER_MIRROR_SCRIPT,
  MASTER_NOTICE_TITLE,
  MASTER_REFUSE_COPY,
  MASTER_STAYS_LINE,
  MASTER_STILL_LINE,
  MASTER_TABLE_LINE,
  MASTER_TOTE_LINE,
  MASTER_WALK_LINE,
} from "@/lib/listing-master";
import { listingMasterWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type MasterViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type MasterViewSheet = {
  kind: MasterViewKind;
  listingId: string;
  isMaster: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function MasterMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={MASTER_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function MasterRefused({ sheet }: { sheet: MasterViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-master-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={MASTER_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A master note is for a burn on the table, not a zip and not a gift code."
              )}
            </p>
            <p>
              {MASTER_TABLE_LINE} {MASTER_BURN_LINE} {MASTER_STILL_LINE}
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

function MasterForm({
  listingId,
  isMaster,
}: {
  listingId: string;
  isMaster: boolean;
}) {
  return (
    <form
      method="post"
      action={listingMasterWritePath()}
      className="space-y-3"
      data-master-form={isMaster ? "open" : "master"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isMaster ? "open" : "master"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/master`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isMaster ? "Leave this burn" : "I don't have the master"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isMaster
          ? "Clear the tape. Status and the tote stay put."
          : `${MASTER_STAYS_LINE} ${MASTER_BURN_LINE} ${MASTER_STILL_LINE} ${MASTER_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingMasterView({
  sheet,
  masterIds,
}: {
  sheet: MasterViewSheet;
  masterIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <MasterMissing />;
  }

  if (sheet.kind !== "physical") {
    return <MasterRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-master-sheet="physical"
      data-master-state={sheet.isMaster ? "master" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: MASTER_MIRROR_SCRIPT }} />
      <SyncMaster listingIds={masterIds} />

      <MallHero>
        <MallCrumb label="I don't have the master">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Master</span>
        </MallCrumb>

        <MallEyebrow>I don't have the master</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isMaster ? MASTER_NOTICE_TITLE : MASTER_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {MASTER_TABLE_LINE} {MASTER_BURN_LINE} {MASTER_WALK_LINE}{" "}
            {MASTER_STAYS_LINE} {MASTER_STILL_LINE} {MASTER_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-master-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isMaster ? (
              <Badge variant="outline">I don't have the master</Badge>
            ) : (
              <Badge variant="ghost">Master not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Master paper
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
            {sheet.isMaster
              ? "Still for sale. Seller taped the master note. Status stays available. Not a fourth status."
              : "This burn. Still spins. Tape it when walkers still want the session folder."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isMaster ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have the master"
              title={MASTER_NOTICE_TITLE}
              body={`${MASTER_STILL_LINE} avail=open still lists this disc.`}
            />
          ) : (
            <ListingMasterEmpty listingId={sheet.listingId} />
          )}

          <MasterForm listingId={sheet.listingId} isMaster={sheet.isMaster} />

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
