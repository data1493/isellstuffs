import Link from "next/link";

import { ListingHandleEmpty } from "@/components/listing-handle-empty";
import { SyncHandle } from "@/components/listing-handle-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  HANDLE_CHIP_LINE,
  HANDLE_COFFEE_LINE,
  HANDLE_LEAVE_LINE,
  HANDLE_MIRROR_SCRIPT,
  HANDLE_NOTICE_TITLE,
  HANDLE_REFUSE_COPY,
  HANDLE_STAYS_LINE,
  HANDLE_STILL_LINE,
  HANDLE_TABLE_LINE,
  HANDLE_TOTE_LINE,
  HANDLE_WALK_LINE,
} from "@/lib/listing-handle";
import { listingHandleWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type HandleViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type HandleViewSheet = {
  kind: HandleViewKind;
  listingId: string;
  isHandle: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function HandleMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={HANDLE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function HandleRefused({ sheet }: { sheet: HandleViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-handle-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={HANDLE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A handle note is for a diner mug on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {HANDLE_TABLE_LINE} {HANDLE_CHIP_LINE} {HANDLE_COFFEE_LINE} {HANDLE_STILL_LINE}
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

function HandleForm({
  listingId,
  isHandle,
}: {
  listingId: string;
  isHandle: boolean;
}) {
  return (
    <form
      method="post"
      action={listingHandleWritePath()}
      className="space-y-3"
      data-handle-form={isHandle ? "open" : "handle"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isHandle ? "open" : "handle"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/handle`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isHandle ? HANDLE_LEAVE_LINE : HANDLE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isHandle
          ? "Clear the tape. Status and the tote stay put."
          : `${HANDLE_STAYS_LINE} ${HANDLE_CHIP_LINE} ${HANDLE_COFFEE_LINE} ${HANDLE_STILL_LINE} ${HANDLE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingHandleView({
  sheet,
  handleIds,
}: {
  sheet: HandleViewSheet;
  handleIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <HandleMissing />;
  }

  if (sheet.kind !== "physical") {
    return <HandleRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-handle-sheet="physical"
      data-handle-state={sheet.isHandle ? "handle" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: HANDLE_MIRROR_SCRIPT }} />
      <SyncHandle listingIds={handleIds} />

      <MallHero>
        <MallCrumb label="I will not handle it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Handle</span>
        </MallCrumb>

        <MallEyebrow>I will not handle it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isHandle ? HANDLE_NOTICE_TITLE : HANDLE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {HANDLE_TABLE_LINE} {HANDLE_CHIP_LINE} {HANDLE_COFFEE_LINE} {HANDLE_WALK_LINE}{" "}
            {HANDLE_STAYS_LINE} {HANDLE_STILL_LINE} {HANDLE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-handle-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isHandle ? (
              <Badge variant="outline">I will not handle it</Badge>
            ) : (
              <Badge variant="ghost">Handle not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Handle paper
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
            {sheet.isHandle
              ? "Still for sale. Seller taped the handle note. Status stays available. Not a shop."
              : "Still a chip. Still coffee. Tape it when walkers still want the mug handled."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isHandle ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not handle it"
              title={HANDLE_NOTICE_TITLE}
              body={`${HANDLE_STILL_LINE} avail=open still lists this mug.`}
            />
          ) : (
            <ListingHandleEmpty listingId={sheet.listingId} />
          )}

          <HandleForm listingId={sheet.listingId} isHandle={sheet.isHandle} />

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
