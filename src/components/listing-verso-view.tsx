import Link from "next/link";

import { ListingVersoEmpty } from "@/components/listing-verso-empty";
import { SyncVerso } from "@/components/listing-verso-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  VERSO_MIRROR_SCRIPT,
  VERSO_NOTICE_TITLE,
  VERSO_REFUSE_COPY,
  VERSO_STAYS_LINE,
  VERSO_STILL_LINE,
  VERSO_TABLE_LINE,
  VERSO_TOTE_LINE,
  VERSO_WALK_LINE,
} from "@/lib/listing-verso";
import { listingPath, listingVersoWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type VersoViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type VersoViewSheet = {
  kind: VersoViewKind;
  listingId: string;
  isVerso: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function VersoMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={VERSO_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function VersoRefused({ sheet }: { sheet: VersoViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-verso-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={VERSO_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "I will not write Side B is for a file on the digital lot, not a cassette and not a gift code."
              )}
            </p>
            <p>
              {VERSO_NOTICE_TITLE} {VERSO_WALK_LINE} {VERSO_STILL_LINE}
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

function VersoForm({
  listingId,
  isVerso,
}: {
  listingId: string;
  isVerso: boolean;
}) {
  return (
    <form
      method="post"
      action={listingVersoWritePath()}
      className="space-y-3"
      data-verso-form={isVerso ? "open" : "verso"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isVerso ? "open" : "verso"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/verso`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isVerso ? "Leave the one page" : "I will not write Side B"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isVerso
          ? "Clear the verso paper. Status and the tote stay put."
          : `${VERSO_STAYS_LINE} ${VERSO_WALK_LINE} ${VERSO_STILL_LINE} ${VERSO_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingVersoView({
  sheet,
  versoIds,
}: {
  sheet: VersoViewSheet;
  versoIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <VersoMissing />;
  }

  if (sheet.kind !== "digital") {
    return <VersoRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-verso-sheet="digital"
      data-verso-state={sheet.isVerso ? "verso" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: VERSO_MIRROR_SCRIPT }} />
      <SyncVerso listingIds={versoIds} />

      <MallHero>
        <MallCrumb label="I will not write Side B">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Verso</span>
        </MallCrumb>

        <MallEyebrow>I will not write Side B</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isVerso ? VERSO_NOTICE_TITLE : VERSO_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {VERSO_NOTICE_TITLE} {VERSO_WALK_LINE} {VERSO_STILL_LINE} {VERSO_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-verso-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isVerso ? (
              <Badge variant="outline">I will not write Side B</Badge>
            ) : (
              <Badge variant="ghost">Still one page</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Verso paper
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
            {sheet.isVerso
              ? "Still for sale. Seller taped that the liner stays one page. Walkers still ask Sunday Crate for Side B. Status stays available."
              : "One page. Tape it when walkers still want a second page."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isVerso ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not write Side B"
              title={VERSO_NOTICE_TITLE}
              body={`${VERSO_STILL_LINE} avail=open still lists this file. ${VERSO_STAYS_LINE}`}
            />
          ) : (
            <ListingVersoEmpty listingId={sheet.listingId} />
          )}

          <VersoForm listingId={sheet.listingId} isVerso={sheet.isVerso} />

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
