import Link from "next/link";

import { ListingMatEmpty } from "@/components/listing-mat-empty";
import { SyncMat } from "@/components/listing-mat-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  MAT_LEAVE_LINE,
  MAT_MIRROR_SCRIPT,
  MAT_NOTICE_TITLE,
  MAT_PAGE_LINE,
  MAT_REFUSE_COPY,
  MAT_STAYS_LINE,
  MAT_STILL_LINE,
  MAT_TABLE_LINE,
  MAT_TOTE_LINE,
  MAT_WALK_LINE,
  MAT_WRONG_LINE,
} from "@/lib/listing-mat";
import { listingMatWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type MatViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "owned";

export type MatViewSheet = {
  kind: MatViewKind;
  listingId: string;
  isMat: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function MatMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={MAT_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function MatRefused({ sheet }: { sheet: MatViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const owned = sheet.kind === "owned";

  return (
    <div data-mat-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : owned
              ? "Another note already owns that one"
              : object
                ? "On the table"
                : "Walked"
        }
        title={MAT_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A mat note is for one liner page, not a jacket and not a gift code."
              )}
            </p>
            <p>
              {MAT_TABLE_LINE} {MAT_PAGE_LINE} {MAT_WRONG_LINE} {MAT_STILL_LINE}
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

function MatForm({
  listingId,
  isMat,
}: {
  listingId: string;
  isMat: boolean;
}) {
  return (
    <form
      method="post"
      action={listingMatWritePath()}
      className="space-y-3"
      data-mat-form={isMat ? "open" : "mat"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isMat ? "open" : "mat"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/mat`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isMat ? MAT_LEAVE_LINE : MAT_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isMat
          ? "Clear the tape. Status and the tote stay put."
          : `${MAT_STAYS_LINE} ${MAT_PAGE_LINE} ${MAT_WRONG_LINE} ${MAT_STILL_LINE} ${MAT_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingMatView({
  sheet,
  matIds,
}: {
  sheet: MatViewSheet;
  matIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <MatMissing />;
  }

  if (sheet.kind !== "digital") {
    return <MatRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-mat-sheet="digital"
      data-mat-state={sheet.isMat ? "mat" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: MAT_MIRROR_SCRIPT }} />
      <SyncMat listingIds={matIds} />

      <MallHero>
        <MallCrumb label="I will not mat it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Mat</span>
        </MallCrumb>

        <MallEyebrow>I will not mat it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isMat ? MAT_NOTICE_TITLE : MAT_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {MAT_TABLE_LINE} {MAT_PAGE_LINE} {MAT_WRONG_LINE} {MAT_WALK_LINE}{" "}
            {MAT_STAYS_LINE} {MAT_STILL_LINE} {MAT_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-mat-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isMat ? (
              <Badge variant="outline">I will not mat it</Badge>
            ) : (
              <Badge variant="ghost">Still one page</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Mat paper
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
            {sheet.isMat
              ? "Still for sale. Seller taped the mat note. Status stays available. Not a copy-shop mount."
              : "Still one page. Still wrong on purpose. Tape it when walkers still want the copy-shop mount."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isMat ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not mat it"
              title={MAT_NOTICE_TITLE}
              body={`${MAT_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingMatEmpty listingId={sheet.listingId} />
          )}

          <MatForm listingId={sheet.listingId} isMat={sheet.isMat} />

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
