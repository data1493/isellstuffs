import Link from "next/link";

import { ListingPeenEmpty } from "@/components/listing-peen-empty";
import { SyncPeen } from "@/components/listing-peen-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  PEEN_LEAVE_LINE,
  PEEN_METAL_LINE,
  PEEN_MIRROR_SCRIPT,
  PEEN_NOTICE_TITLE,
  PEEN_REFUSE_COPY,
  PEEN_SPLAYED_LINE,
  PEEN_STAYS_LINE,
  PEEN_STILL_LINE,
  PEEN_TABLE_LINE,
  PEEN_TOTE_LINE,
  PEEN_WALK_LINE,
} from "@/lib/listing-peen";
import { listingPath, listingPeenWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type PeenViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "mug"
  | "lid"
  | "owned";

export type PeenViewSheet = {
  kind: PeenViewKind;
  listingId: string;
  isPeen: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function PeenMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={PEEN_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function PeenRefused({ sheet }: { sheet: PeenViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const mug = sheet.kind === "mug";
  const lid = sheet.kind === "lid";
  const owned = sheet.kind === "owned";

  return (
    <div data-peen-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : mug
                ? "A mug is not a collar"
                : lid
                  ? "A lid is not a collar"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={PEEN_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A peen note is for the balloon whisk on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {PEEN_TABLE_LINE} {PEEN_SPLAYED_LINE} {PEEN_METAL_LINE}{" "}
              {PEEN_STILL_LINE}
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

function PeenForm({
  listingId,
  isPeen,
}: {
  listingId: string;
  isPeen: boolean;
}) {
  return (
    <form
      method="post"
      action={listingPeenWritePath()}
      className="space-y-3"
      data-peen-form={isPeen ? "open" : "peen"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isPeen ? "open" : "peen"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/peen`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isPeen ? PEEN_LEAVE_LINE : PEEN_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isPeen
          ? "Clear the tape. Status and the tote stay put."
          : `${PEEN_STAYS_LINE} ${PEEN_SPLAYED_LINE} ${PEEN_METAL_LINE} ${PEEN_STILL_LINE} ${PEEN_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingPeenView({
  sheet,
  peenIds,
}: {
  sheet: PeenViewSheet;
  peenIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <PeenMissing />;
  }

  if (sheet.kind !== "physical") {
    return <PeenRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-peen-sheet="physical"
      data-peen-state={sheet.isPeen ? "peen" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: PEEN_MIRROR_SCRIPT }} />
      <SyncPeen listingIds={peenIds} />

      <MallHero>
        <MallCrumb label="I will not peen it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Peen</span>
        </MallCrumb>

        <MallEyebrow>I will not peen it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isPeen ? PEEN_NOTICE_TITLE : PEEN_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {PEEN_TABLE_LINE} {PEEN_SPLAYED_LINE} {PEEN_METAL_LINE}{" "}
            {PEEN_WALK_LINE} {PEEN_STAYS_LINE} {PEEN_STILL_LINE}{" "}
            {PEEN_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-peen-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isPeen ? (
              <Badge variant="outline">I will not peen it</Badge>
            ) : (
              <Badge variant="ghost">Peen not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Peen paper
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
            {sheet.isPeen
              ? "Still for sale. Seller taped the peen note. Status stays available. Not a metal shop."
              : "Still splayed. Still metal. Tape it when walkers still want the collar hammered."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isPeen ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not peen it"
              title={PEEN_NOTICE_TITLE}
              body={`${PEEN_STILL_LINE} avail=open still lists this whisk.`}
            />
          ) : (
            <ListingPeenEmpty listingId={sheet.listingId} />
          )}

          <PeenForm listingId={sheet.listingId} isPeen={sheet.isPeen} />

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
