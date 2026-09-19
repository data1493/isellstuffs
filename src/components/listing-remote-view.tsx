import Link from "next/link";

import { ListingRemoteEmpty } from "@/components/listing-remote-empty";
import { SyncRemote } from "@/components/listing-remote-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  REMOTE_CELLS_LINE,
  REMOTE_CLICKER_LINE,
  REMOTE_MIRROR_SCRIPT,
  REMOTE_PARTS_LINE,
  REMOTE_REFUSE_COPY,
  REMOTE_STILL_LINE,
  REMOTE_TABLE_LINE,
  REMOTE_TOTE_LINE,
} from "@/lib/listing-remote";
import { listingPath, listingRemoteWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type RemoteViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type RemoteViewSheet = {
  kind: RemoteViewKind;
  listingId: string;
  isRemote: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function RemoteMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={REMOTE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function RemoteRefused({ sheet }: { sheet: RemoteViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-remote-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={REMOTE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Remote honesty is for a living-room pile on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {REMOTE_TABLE_LINE} {REMOTE_CLICKER_LINE} {REMOTE_STILL_LINE}
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

function RemoteForm({
  listingId,
  isRemote,
}: {
  listingId: string;
  isRemote: boolean;
}) {
  return (
    <form
      method="post"
      action={listingRemoteWritePath()}
      className="space-y-3"
      data-remote-form={isRemote ? "open" : "remote"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isRemote ? "open" : "remote"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/remote`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isRemote ? "Clicker is in" : "The remote walked"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isRemote
          ? "Clear the tape. Status and the tote stay put."
          : `${REMOTE_CLICKER_LINE} ${REMOTE_STILL_LINE} ${REMOTE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingRemoteView({
  sheet,
  remoteIds,
}: {
  sheet: RemoteViewSheet;
  remoteIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <RemoteMissing />;
  }

  if (sheet.kind !== "physical") {
    return <RemoteRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-remote-sheet="physical"
      data-remote-state={sheet.isRemote ? "remote" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: REMOTE_MIRROR_SCRIPT }} />
      <SyncRemote listingIds={remoteIds} />

      <MallHero>
        <MallCrumb label="The remote walked">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Remote</span>
        </MallCrumb>

        <MallEyebrow>Remote honesty</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isRemote ? REMOTE_TABLE_LINE : "The remote walked."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {REMOTE_TABLE_LINE} {REMOTE_CLICKER_LINE} {REMOTE_STILL_LINE}{" "}
            {REMOTE_TOTE_LINE} {REMOTE_CELLS_LINE} {REMOTE_PARTS_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-remote-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isRemote ? (
              <Badge variant="outline">The remote walked</Badge>
            ) : (
              <Badge variant="ghost">Clicker is in</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Remote tag
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
            {sheet.isRemote
              ? "Still for sale. Seller taped the remote. Status stays available. Not a fourth status."
              : "Cells are AAs. Tape the remote when the living-room clicker walked."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isRemote ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="The remote walked"
              title={REMOTE_TABLE_LINE}
              body={`${REMOTE_CLICKER_LINE} ${REMOTE_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingRemoteEmpty listingId={sheet.listingId} />
          )}

          <RemoteForm listingId={sheet.listingId} isRemote={sheet.isRemote} />

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
