import Link from "next/link";

import { ListingSoleEmpty } from "@/components/listing-sole-empty";
import { SyncSole } from "@/components/listing-sole-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  SOLE_LACES_LINE,
  SOLE_MIRROR_SCRIPT,
  SOLE_REFUSE_COPY,
  SOLE_STAYS_LINE,
  SOLE_STILL_LINE,
  SOLE_TABLE_LINE,
  SOLE_TOE_LINE,
  SOLE_TOTE_LINE,
  SOLE_WALK_LINE,
} from "@/lib/listing-sole";
import { listingPath, listingSoleWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type SoleViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type SoleViewSheet = {
  kind: SoleViewKind;
  listingId: string;
  isSole: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function SoleMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={SOLE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function SoleRefused({ sheet }: { sheet: SoleViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-sole-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={SOLE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A cobbler refusal is for sneakers on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {SOLE_TABLE_LINE} {SOLE_TOE_LINE} {SOLE_LACES_LINE} {SOLE_STILL_LINE}
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

function SoleForm({
  listingId,
  isSole,
}: {
  listingId: string;
  isSole: boolean;
}) {
  return (
    <form
      method="post"
      action={listingSoleWritePath()}
      className="space-y-3"
      data-sole-form={isSole ? "open" : "sole"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isSole ? "open" : "sole"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/sole`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isSole ? "Leave the soles" : "I will not resole"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isSole
          ? "Clear the tape. Status and the tote stay put."
          : `${SOLE_STAYS_LINE} ${SOLE_WALK_LINE} ${SOLE_STILL_LINE} ${SOLE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingSoleView({
  sheet,
  soleIds,
}: {
  sheet: SoleViewSheet;
  soleIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <SoleMissing />;
  }

  if (sheet.kind !== "physical") {
    return <SoleRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-sole-sheet="physical"
      data-sole-state={sheet.isSole ? "sole" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: SOLE_MIRROR_SCRIPT }} />
      <SyncSole listingIds={soleIds} />

      <MallHero>
        <MallCrumb label="I will not resole">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Sole</span>
        </MallCrumb>

        <MallEyebrow>Cobbler refusal</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isSole ? SOLE_TABLE_LINE : "I will not resole."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SOLE_TABLE_LINE} {SOLE_TOE_LINE} {SOLE_LACES_LINE} {SOLE_STAYS_LINE}{" "}
            {SOLE_WALK_LINE} {SOLE_STILL_LINE} {SOLE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-sole-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isSole ? (
              <Badge variant="outline">I will not resole</Badge>
            ) : (
              <Badge variant="ghost">Resole not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Sole tag
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
            {sheet.isSole
              ? "Still for sale. Seller taped the cobbler refusal. Status stays available. Not a fourth status."
              : "Peel is the toe. Laces stayed home. Tape the refusal when walkers still want a new sole."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isSole ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not resole"
              title={SOLE_TABLE_LINE}
              body={`${SOLE_STAYS_LINE} ${SOLE_WALK_LINE} ${SOLE_STILL_LINE} avail=open still lists this pair.`}
            />
          ) : (
            <ListingSoleEmpty listingId={sheet.listingId} />
          )}

          <SoleForm listingId={sheet.listingId} isSole={sheet.isSole} />

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
