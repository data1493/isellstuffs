import Link from "next/link";

import { ListingTrayEmpty } from "@/components/listing-tray-empty";
import { SyncTray } from "@/components/listing-tray-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  TRAY_CASE_LINE,
  TRAY_MIRROR_SCRIPT,
  TRAY_NOTICE_TITLE,
  TRAY_REFUSE_COPY,
  TRAY_STAYS_LINE,
  TRAY_STILL_LINE,
  TRAY_TABLE_LINE,
  TRAY_TOTE_LINE,
  TRAY_WALK_LINE,
} from "@/lib/listing-tray";
import { listingPath, listingTrayWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type TrayViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type TrayViewSheet = {
  kind: TrayViewKind;
  listingId: string;
  isTray: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function TrayMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={TRAY_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function TrayRefused({ sheet }: { sheet: TrayViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-tray-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={TRAY_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A tray note is for a jewel on the table, not a zip and not a gift code."
              )}
            </p>
            <p>
              {TRAY_TABLE_LINE} {TRAY_CASE_LINE} {TRAY_STILL_LINE}
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

function TrayForm({
  listingId,
  isTray,
}: {
  listingId: string;
  isTray: boolean;
}) {
  return (
    <form
      method="post"
      action={listingTrayWritePath()}
      className="space-y-3"
      data-tray-form={isTray ? "open" : "tray"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isTray ? "open" : "tray"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/tray`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isTray ? "Leave this jewel" : "I will not tray it"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isTray
          ? "Clear the tape. Status and the tote stay put."
          : `${TRAY_STAYS_LINE} ${TRAY_CASE_LINE} ${TRAY_STILL_LINE} ${TRAY_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingTrayView({
  sheet,
  trayIds,
}: {
  sheet: TrayViewSheet;
  trayIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <TrayMissing />;
  }

  if (sheet.kind !== "physical") {
    return <TrayRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-tray-sheet="physical"
      data-tray-state={sheet.isTray ? "tray" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: TRAY_MIRROR_SCRIPT }} />
      <SyncTray listingIds={trayIds} />

      <MallHero>
        <MallCrumb label="I will not tray it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Tray</span>
        </MallCrumb>

        <MallEyebrow>I will not tray it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isTray ? TRAY_NOTICE_TITLE : TRAY_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {TRAY_TABLE_LINE} {TRAY_CASE_LINE} {TRAY_WALK_LINE}{" "}
            {TRAY_STAYS_LINE} {TRAY_STILL_LINE} {TRAY_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-tray-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isTray ? (
              <Badge variant="outline">I will not tray it</Badge>
            ) : (
              <Badge variant="ghost">Tray not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Tray paper
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
            {sheet.isTray
              ? "Still for sale. Seller taped the tray note. Status stays available. Not a fourth status."
              : "This case. Still spins. Tape it when walkers still want a cleaner jewel."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isTray ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not tray it"
              title={TRAY_NOTICE_TITLE}
              body={`${TRAY_STILL_LINE} avail=open still lists this disc.`}
            />
          ) : (
            <ListingTrayEmpty listingId={sheet.listingId} />
          )}

          <TrayForm listingId={sheet.listingId} isTray={sheet.isTray} />

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
