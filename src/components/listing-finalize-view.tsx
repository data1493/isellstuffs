import Link from "next/link";

import { ListingFinalizeEmpty } from "@/components/listing-finalize-empty";
import { SyncFinalize } from "@/components/listing-finalize-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  FINALIZE_LEAVE_LINE,
  FINALIZE_MIRROR_SCRIPT,
  FINALIZE_NOTICE_TITLE,
  FINALIZE_REFUSE_COPY,
  FINALIZE_SCRATCHED_LINE,
  FINALIZE_SHARPIE_LINE,
  FINALIZE_STAYS_LINE,
  FINALIZE_STILL_LINE,
  FINALIZE_TABLE_LINE,
  FINALIZE_TOTE_LINE,
  FINALIZE_WALK_LINE,
} from "@/lib/listing-finalize";
import { listingFinalizeWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type FinalizeViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type FinalizeViewSheet = {
  kind: FinalizeViewKind;
  listingId: string;
  isFinalize: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function FinalizeMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={FINALIZE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function FinalizeRefused({ sheet }: { sheet: FinalizeViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-finalize-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={FINALIZE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A finalize note is for a disc on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {FINALIZE_TABLE_LINE} {FINALIZE_SHARPIE_LINE} {FINALIZE_SCRATCHED_LINE}{" "}
              {FINALIZE_STILL_LINE}
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

function FinalizeForm({
  listingId,
  isFinalize,
}: {
  listingId: string;
  isFinalize: boolean;
}) {
  return (
    <form
      method="post"
      action={listingFinalizeWritePath()}
      className="space-y-3"
      data-finalize-form={isFinalize ? "open" : "finalize"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isFinalize ? "open" : "finalize"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/finalize`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isFinalize ? FINALIZE_LEAVE_LINE : FINALIZE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isFinalize
          ? "Clear the tape. Status and the tote stay put."
          : `${FINALIZE_STAYS_LINE} ${FINALIZE_SHARPIE_LINE} ${FINALIZE_SCRATCHED_LINE} ${FINALIZE_STILL_LINE} ${FINALIZE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingFinalizeView({
  sheet,
  finalizeIds,
}: {
  sheet: FinalizeViewSheet;
  finalizeIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <FinalizeMissing />;
  }

  if (sheet.kind !== "physical") {
    return <FinalizeRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-finalize-sheet="physical"
      data-finalize-state={sheet.isFinalize ? "finalize" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: FINALIZE_MIRROR_SCRIPT }} />
      <SyncFinalize listingIds={finalizeIds} />

      <MallHero>
        <MallCrumb label="I will not finalize it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Finalize</span>
        </MallCrumb>

        <MallEyebrow>I will not finalize it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isFinalize ? FINALIZE_NOTICE_TITLE : FINALIZE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {FINALIZE_TABLE_LINE} {FINALIZE_SHARPIE_LINE} {FINALIZE_SCRATCHED_LINE}{" "}
            {FINALIZE_WALK_LINE} {FINALIZE_STAYS_LINE} {FINALIZE_STILL_LINE}{" "}
            {FINALIZE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-finalize-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isFinalize ? (
              <Badge variant="outline">I will not finalize it</Badge>
            ) : (
              <Badge variant="ghost">Finalize not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Finalize paper
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
            {sheet.isFinalize
              ? "Still for sale. Seller taped the finalize note. Status stays available. Not a closer."
              : "Still Sharpie. Still scratched. Tape it when walkers still want the session closed."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isFinalize ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not finalize it"
              title={FINALIZE_NOTICE_TITLE}
              body={`${FINALIZE_STILL_LINE} avail=open still lists this disc.`}
            />
          ) : (
            <ListingFinalizeEmpty listingId={sheet.listingId} />
          )}

          <FinalizeForm listingId={sheet.listingId} isFinalize={sheet.isFinalize} />

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
