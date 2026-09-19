import Link from "next/link";

import { ListingSandEmpty } from "@/components/listing-sand-empty";
import { SyncSand } from "@/components/listing-sand-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  SAND_CHIP_LINE,
  SAND_LEAVE_LINE,
  SAND_MIRROR_SCRIPT,
  SAND_MUG_LINE,
  SAND_NOTICE_TITLE,
  SAND_REFUSE_COPY,
  SAND_STAYS_LINE,
  SAND_STILL_LINE,
  SAND_TABLE_LINE,
  SAND_TOTE_LINE,
  SAND_WALK_LINE,
} from "@/lib/listing-sand";
import { listingPath, listingSandWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type SandViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type SandViewSheet = {
  kind: SandViewKind;
  listingId: string;
  isSand: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function SandMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={SAND_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function SandRefused({ sheet }: { sheet: SandViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-sand-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={SAND_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A sand note is for mugs on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {SAND_TABLE_LINE} {SAND_CHIP_LINE} {SAND_MUG_LINE} {SAND_STILL_LINE}
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

function SandForm({
  listingId,
  isSand,
}: {
  listingId: string;
  isSand: boolean;
}) {
  return (
    <form
      method="post"
      action={listingSandWritePath()}
      className="space-y-3"
      data-sand-form={isSand ? "open" : "sand"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isSand ? "open" : "sand"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/sand`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isSand ? SAND_LEAVE_LINE : SAND_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isSand
          ? "Clear the tape. Status and the tote stay put."
          : `${SAND_STAYS_LINE} ${SAND_CHIP_LINE} ${SAND_MUG_LINE} ${SAND_STILL_LINE} ${SAND_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingSandView({
  sheet,
  sandIds,
}: {
  sheet: SandViewSheet;
  sandIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <SandMissing />;
  }

  if (sheet.kind !== "physical") {
    return <SandRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-sand-sheet="physical"
      data-sand-state={sheet.isSand ? "sand" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: SAND_MIRROR_SCRIPT }} />
      <SyncSand listingIds={sandIds} />

      <MallHero>
        <MallCrumb label="I will not sand it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Sand</span>
        </MallCrumb>

        <MallEyebrow>I will not sand it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isSand ? SAND_NOTICE_TITLE : SAND_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SAND_TABLE_LINE} {SAND_CHIP_LINE} {SAND_MUG_LINE} {SAND_WALK_LINE}{" "}
            {SAND_STAYS_LINE} {SAND_STILL_LINE} {SAND_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-sand-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isSand ? (
              <Badge variant="outline">I will not sand it</Badge>
            ) : (
              <Badge variant="ghost">Sand not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Sand paper
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
            {sheet.isSand
              ? "Still for sale. Seller taped the sand note. Status stays available. Not a shop."
              : "Chip stays. Still a mug. Tape it when walkers still want the rim sanded smooth."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isSand ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not sand it"
              title={SAND_NOTICE_TITLE}
              body={`${SAND_STILL_LINE} avail=open still lists this mug.`}
            />
          ) : (
            <ListingSandEmpty listingId={sheet.listingId} />
          )}

          <SandForm listingId={sheet.listingId} isSand={sheet.isSand} />

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
