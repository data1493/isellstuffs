import Link from "next/link";

import { ListingGlueEmpty } from "@/components/listing-glue-empty";
import { SyncGlue } from "@/components/listing-glue-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  GLUE_CELLS_LINE,
  GLUE_LINE_LINE,
  GLUE_MIRROR_SCRIPT,
  GLUE_NOTICE_TITLE,
  GLUE_PRESS_LINE,
  GLUE_REFUSE_COPY,
  GLUE_STAYS_LINE,
  GLUE_STILL_LINE,
  GLUE_TABLE_LINE,
  GLUE_TOTE_LINE,
  GLUE_WALK_LINE,
} from "@/lib/listing-glue";
import { listingGlueWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type GlueViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type GlueViewSheet = {
  kind: GlueViewKind;
  listingId: string;
  isGlue: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function GlueMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={GLUE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function GlueRefused({ sheet }: { sheet: GlueViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-glue-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={GLUE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A glue refusal is for a handheld on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {GLUE_TABLE_LINE} {GLUE_PRESS_LINE} {GLUE_LINE_LINE}{" "}
              {GLUE_STILL_LINE}
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

function GlueForm({
  listingId,
  isGlue,
}: {
  listingId: string;
  isGlue: boolean;
}) {
  return (
    <form
      method="post"
      action={listingGlueWritePath()}
      className="space-y-3"
      data-glue-form={isGlue ? "open" : "glue"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isGlue ? "open" : "glue"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/glue`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isGlue ? "Leave the crack" : "I will not glue"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isGlue
          ? "Clear the tape. Status and the tote stay put."
          : `${GLUE_STAYS_LINE} ${GLUE_PRESS_LINE} ${GLUE_STILL_LINE} ${GLUE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingGlueView({
  sheet,
  glueIds,
}: {
  sheet: GlueViewSheet;
  glueIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <GlueMissing />;
  }

  if (sheet.kind !== "physical") {
    return <GlueRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-glue-sheet="physical"
      data-glue-state={sheet.isGlue ? "glue" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: GLUE_MIRROR_SCRIPT }} />
      <SyncGlue listingIds={glueIds} />

      <MallHero>
        <MallCrumb label="I will not glue">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Glue</span>
        </MallCrumb>

        <MallEyebrow>Glue refusal</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isGlue ? GLUE_NOTICE_TITLE : GLUE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {GLUE_NOTICE_TITLE} {GLUE_LINE_LINE} {GLUE_CELLS_LINE} {GLUE_WALK_LINE}{" "}
            {GLUE_STAYS_LINE} {GLUE_STILL_LINE} {GLUE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-glue-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isGlue ? (
              <Badge variant="outline">I will not glue</Badge>
            ) : (
              <Badge variant="ghost">Glue not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Glue tag
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
            {sheet.isGlue
              ? "Still for sale. Seller taped the glue refusal. Status stays available. Not a fourth status."
              : "Line is the screen. Dump is no ROM. Cells are the AAs. Tape the refusal when walkers still want the plastic glued."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isGlue ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not glue"
              title={GLUE_NOTICE_TITLE}
              body={`${GLUE_STAYS_LINE} ${GLUE_PRESS_LINE} ${GLUE_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingGlueEmpty listingId={sheet.listingId} />
          )}

          <GlueForm listingId={sheet.listingId} isGlue={sheet.isGlue} />

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
