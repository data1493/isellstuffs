import Link from "next/link";

import { ListingCrackEmpty } from "@/components/listing-crack-empty";
import { SyncCrack } from "@/components/listing-crack-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  CRACK_BASE_LINE,
  CRACK_CORD_LINE,
  CRACK_MIRROR_SCRIPT,
  CRACK_REFUSE_COPY,
  CRACK_STILL_LINE,
  CRACK_TABLE_LINE,
  CRACK_TOTE_LINE,
} from "@/lib/listing-crack";
import { listingCrackWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type CrackViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type CrackViewSheet = {
  kind: CrackViewKind;
  listingId: string;
  isCrack: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function CrackMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={CRACK_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function CrackRefused({ sheet }: { sheet: CrackViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-crack-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={CRACK_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Crack honesty is for a ceramic lamp on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {CRACK_TABLE_LINE} {CRACK_CORD_LINE} {CRACK_BASE_LINE}{" "}
              {CRACK_STILL_LINE}
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

function CrackForm({
  listingId,
  isCrack,
}: {
  listingId: string;
  isCrack: boolean;
}) {
  return (
    <form
      method="post"
      action={listingCrackWritePath()}
      className="space-y-3"
      data-crack-form={isCrack ? "open" : "crack"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isCrack ? "open" : "crack"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/crack`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isCrack ? "The crack is off the tape" : "The crack stays"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isCrack
          ? "Clear the tape. Status and the tote stay put."
          : `${CRACK_BASE_LINE} ${CRACK_STILL_LINE} ${CRACK_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingCrackView({
  sheet,
  crackIds,
}: {
  sheet: CrackViewSheet;
  crackIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <CrackMissing />;
  }

  if (sheet.kind !== "physical") {
    return <CrackRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-crack-sheet="physical"
      data-crack-state={sheet.isCrack ? "crack" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: CRACK_MIRROR_SCRIPT }} />
      <SyncCrack listingIds={crackIds} />

      <MallHero>
        <MallCrumb label="The crack stays">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Crack</span>
        </MallCrumb>

        <MallEyebrow>Ceramic base crack</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isCrack ? CRACK_TABLE_LINE : "The crack stays."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {CRACK_TABLE_LINE} {CRACK_CORD_LINE} {CRACK_BASE_LINE}{" "}
            {CRACK_STILL_LINE} {CRACK_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-crack-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isCrack ? (
              <Badge variant="outline">The crack stays</Badge>
            ) : (
              <Badge variant="ghost">Crack not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Crack tag
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
            {sheet.isCrack
              ? "Still for sale. Seller taped the ceramic crack. Status stays available. Not a fourth status."
              : "Cord is rewired. Box is the shade. Tape the crack when the ceramic base already holds it."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isCrack ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="The crack stays"
              title={CRACK_TABLE_LINE}
              body={`${CRACK_BASE_LINE} ${CRACK_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingCrackEmpty listingId={sheet.listingId} />
          )}

          <CrackForm listingId={sheet.listingId} isCrack={sheet.isCrack} />

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
