import Link from "next/link";

import { ListingStemsEmpty } from "@/components/listing-stems-empty";
import { SyncStems } from "@/components/listing-stems-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  STEMS_FOLDER_LINE,
  STEMS_GRADE_LINE,
  STEMS_MIRROR_SCRIPT,
  STEMS_PACK_LINE,
  STEMS_REFUSE_COPY,
  STEMS_STILL_LINE,
  STEMS_TABLE_LINE,
  STEMS_TOTE_LINE,
} from "@/lib/listing-stems";
import { listingPath, listingStemsWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type StemsViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type StemsViewSheet = {
  kind: StemsViewKind;
  listingId: string;
  isStems: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function StemsMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={STEMS_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function StemsRefused({ sheet }: { sheet: StemsViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-stems-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={STEMS_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "These twelve shots is for a file on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {STEMS_TABLE_LINE} {STEMS_PACK_LINE} {STEMS_GRADE_LINE}{" "}
              {STEMS_STILL_LINE}
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

function StemsForm({
  listingId,
  isStems,
}: {
  listingId: string;
  isStems: boolean;
}) {
  return (
    <form
      method="post"
      action={listingStemsWritePath()}
      className="space-y-3"
      data-stems-form={isStems ? "open" : "stems"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isStems ? "open" : "stems"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/stems`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isStems ? "Take the twelve-shot tape off" : "These twelve shots"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isStems
          ? "Clear the shot-count paper. Status and the tote stay put."
          : `${STEMS_PACK_LINE} ${STEMS_GRADE_LINE} ${STEMS_STILL_LINE} ${STEMS_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingStemsView({
  sheet,
  stemsIds,
}: {
  sheet: StemsViewSheet;
  stemsIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <StemsMissing />;
  }

  if (sheet.kind !== "digital") {
    return <StemsRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-stems-sheet="digital"
      data-stems-state={sheet.isStems ? "stems" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: STEMS_MIRROR_SCRIPT }} />
      <SyncStems listingIds={stemsIds} />

      <MallHero>
        <MallCrumb label="These twelve shots">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Shots</span>
        </MallCrumb>

        <MallEyebrow>These twelve shots</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isStems ? STEMS_TABLE_LINE : "These twelve shots."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {STEMS_TABLE_LINE} {STEMS_PACK_LINE} {STEMS_GRADE_LINE}{" "}
            {STEMS_STILL_LINE} {STEMS_TOTE_LINE} {STEMS_FOLDER_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-stems-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isStems ? (
              <Badge variant="outline">Twelve shots</Badge>
            ) : (
              <Badge variant="ghost">Stem kit?</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Shot-count paper
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
            {sheet.isStems
              ? "Still for sale. Seller taped twelve shots. Walkers still ask Beats for a stem kit. Status stays available."
              : "Grade is I don't grade. Tape the count when the pack is twelve shots, not stems."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isStems ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="These twelve shots"
              title={STEMS_TABLE_LINE}
              body={`${STEMS_STILL_LINE} avail=open still lists this file. ${STEMS_PACK_LINE}`}
            />
          ) : (
            <ListingStemsEmpty listingId={sheet.listingId} />
          )}

          <StemsForm listingId={sheet.listingId} isStems={sheet.isStems} />

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
