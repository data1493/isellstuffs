import Link from "next/link";

import { ListingCordEmpty } from "@/components/listing-cord-empty";
import { SyncCord } from "@/components/listing-cord-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  CORD_FACTORY_LINE,
  CORD_LAMP_LINE,
  CORD_MIRROR_SCRIPT,
  CORD_REFUSE_COPY,
  CORD_SHELL_LINE,
  CORD_STILL_LINE,
  CORD_TABLE_LINE,
  CORD_TOTE_LINE,
} from "@/lib/listing-cord";
import { listingCordWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type CordViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type CordViewSheet = {
  kind: CordViewKind;
  listingId: string;
  isCord: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function CordMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={CORD_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function CordRefused({ sheet }: { sheet: CordViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-cord-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={CORD_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Rewire tape is for a lamp on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {CORD_TABLE_LINE} {CORD_LAMP_LINE} {CORD_FACTORY_LINE}{" "}
              {CORD_STILL_LINE}
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

function CordForm({
  listingId,
  isCord,
}: {
  listingId: string;
  isCord: boolean;
}) {
  return (
    <form
      method="post"
      action={listingCordWritePath()}
      className="space-y-3"
      data-cord-form={isCord ? "open" : "cord"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isCord ? "open" : "cord"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/cord`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isCord ? "Factory cord" : "Rewired. Not the factory cord."}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isCord
          ? "Clear the tape. Status and the tote stay put."
          : `${CORD_LAMP_LINE} ${CORD_FACTORY_LINE} ${CORD_SHELL_LINE} ${CORD_STILL_LINE} ${CORD_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingCordView({
  sheet,
  cordIds,
}: {
  sheet: CordViewSheet;
  cordIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <CordMissing />;
  }

  if (sheet.kind !== "physical") {
    return <CordRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-cord-sheet="physical"
      data-cord-state={sheet.isCord ? "cord" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: CORD_MIRROR_SCRIPT }} />
      <SyncCord listingIds={cordIds} />

      <MallHero>
        <MallCrumb label="Rewired">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Cord</span>
        </MallCrumb>

        <MallEyebrow>Rewired</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isCord ? CORD_TABLE_LINE : "Rewired. Not the factory cord."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {CORD_TABLE_LINE} {CORD_LAMP_LINE} {CORD_FACTORY_LINE} {CORD_SHELL_LINE}{" "}
            {CORD_STILL_LINE} {CORD_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-cord-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isCord ? (
              <Badge variant="outline">Rewired</Badge>
            ) : (
              <Badge variant="ghost">No rewire tape</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Rewired
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
            {sheet.isCord
              ? "Still for sale. Seller swapped the cord. Walkers still bag it. Status stays available."
              : "Shell is the blister. This is the lamp. Tape rewire when the cord is already new."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isCord ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Rewired"
              title={CORD_TABLE_LINE}
              body={`${CORD_STILL_LINE} avail=open still lists this pile. ${CORD_FACTORY_LINE}`}
            />
          ) : (
            <ListingCordEmpty listingId={sheet.listingId} />
          )}

          <CordForm listingId={sheet.listingId} isCord={sheet.isCord} />

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
